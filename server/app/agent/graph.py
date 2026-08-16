from contextlib import AsyncExitStack

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.graph import END, StateGraph

from app.agent.personality import Personality
from app.agent.state import AgentState
from app.config import Settings, get_settings
from app.db.session import SessionLocal
from app.guardrails.guardrails import InputGuardrail, OutputGuardrail
from app.llm.chat import ChatModelFactory
from app.memory.manager import MemoryManager

_MAX_OUTPUT_RETRIES = 1


class AgentGraph:
    """Owns the LangGraph StateGraph that drives one exchange: guardrail the
    input, pull relevant memory, generate a persona-consistent reply,
    guardrail the output, then decide what (if anything) is worth
    remembering long-term.

    Short-term memory is handled by the LangGraph Postgres checkpointer,
    which persists the full message state per conversation thread.
    """

    def __init__(
        self,
        settings: Settings | None = None,
        chat_factory: ChatModelFactory | None = None,
        memory_manager: MemoryManager | None = None,
        input_guardrail: InputGuardrail | None = None,
        output_guardrail: OutputGuardrail | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._chat_factory = chat_factory or ChatModelFactory()
        self._memory = memory_manager or MemoryManager()
        self._input_guardrail = input_guardrail or InputGuardrail()
        self._output_guardrail = output_guardrail or OutputGuardrail()
        self._checkpointer: AsyncPostgresSaver | None = None
        self._compiled = None
        self._exit_stack = AsyncExitStack()

    async def setup(self) -> None:
        self._checkpointer = await self._exit_stack.enter_async_context(
            AsyncPostgresSaver.from_conn_string(self._settings.database_url_sync)
        )
        await self._checkpointer.setup()
        self._compiled = self._build_graph().compile(checkpointer=self._checkpointer)

    async def aclose(self) -> None:
        await self._exit_stack.aclose()

    def _build_graph(self) -> StateGraph:
        graph = StateGraph(AgentState)
        graph.add_node("guardrail_input", self._guardrail_input_node)
        graph.add_node("retrieve_memory", self._retrieve_memory_node)
        graph.add_node("generate", self._generate_node)
        graph.add_node("guardrail_output", self._guardrail_output_node)
        graph.add_node("memory_classify", self._memory_classify_node)
        graph.add_node("blocked_reply", self._blocked_reply_node)

        graph.set_entry_point("guardrail_input")
        graph.add_conditional_edges(
            "guardrail_input",
            lambda state: "blocked" if state.get("blocked") else "ok",
            {"blocked": "blocked_reply", "ok": "retrieve_memory"},
        )
        graph.add_edge("retrieve_memory", "generate")
        graph.add_conditional_edges(
            "generate",
            lambda state: "skip_output_check" if state.get("mode") == "proactive" else "check",
            {"skip_output_check": "memory_classify", "check": "guardrail_output"},
        )
        graph.add_conditional_edges(
            "guardrail_output",
            self._route_after_output_check,
            {"retry": "generate", "accept": "memory_classify"},
        )
        graph.add_edge("memory_classify", END)
        graph.add_edge("blocked_reply", END)
        return graph

    @staticmethod
    def _route_after_output_check(state: AgentState) -> str:
        if state.get("blocked") and state.get("retry_count", 0) < _MAX_OUTPUT_RETRIES:
            return "retry"
        return "accept"

    # -- Nodes ---------------------------------------------------------

    async def _guardrail_input_node(self, state: AgentState) -> dict:
        if state.get("mode") == "proactive":
            return {"blocked": False}
        last_human = next((m for m in reversed(state.get("messages", [])) if isinstance(m, HumanMessage)), None)
        if last_human is None:
            return {"blocked": False}
        verdict = await self._input_guardrail.check(last_human.content)
        return {"blocked": not verdict.allowed, "block_reason": verdict.reason}

    async def _retrieve_memory_node(self, state: AgentState) -> dict:
        messages = state.get("messages", [])
        query = messages[-1].content if messages else state["personality"].describe()
        async with SessionLocal() as db:
            memories = await self._memory.retrieve_long_term(db, user_id=state["user_id"], query=query)
        return {"retrieved_memories": [m.content for m in memories]}

    async def _generate_node(self, state: AgentState) -> dict:
        personality: Personality = state["personality"]
        system_parts = [personality.as_system_message()]
        if state.get("retrieved_memories"):
            recalled = "\n".join(f"- {m}" for m in state["retrieved_memories"])
            system_parts.append(f"Relevant things you remember about this user:\n{recalled}")
        if state.get("mode") == "proactive":
            system_parts.append(
                "The user hasn't messaged in a while. Reach out first with a short, "
                "in-character message that fits the conversation so far."
            )
        if state.get("blocked") and state.get("block_reason"):
            system_parts.append(
                f"Your previous draft broke character ({state['block_reason']}). "
                "Rewrite it so it strictly stays in persona and on-topic."
            )

        window = state.get("messages", [])[-self._settings.short_term_window :]
        model = self._chat_factory.build()
        reply = await model.ainvoke([SystemMessage(content="\n\n".join(system_parts)), *window])

        return {
            "messages": [reply],
            "retry_count": state.get("retry_count", 0) + (1 if state.get("blocked") else 0),
            "blocked": False,
        }

    async def _guardrail_output_node(self, state: AgentState) -> dict:
        messages = state.get("messages", [])
        if not messages:
            return {"blocked": False}
        draft = messages[-1]
        verdict = await self._output_guardrail.check(
            personality_description=state["personality"].describe(), draft_reply=draft.content
        )
        return {"blocked": not verdict.passes, "block_reason": verdict.reason}

    async def _memory_classify_node(self, state: AgentState) -> dict:
        if state.get("mode") == "proactive":
            return {}
        messages = state.get("messages", [])
        last_human = next((m for m in reversed(messages[:-1]) if isinstance(m, HumanMessage)), None)
        last_ai = messages[-1] if messages else None
        if last_human is None or last_ai is None:
            return {}
        async with SessionLocal() as db:
            await self._memory.consider_and_store(
                db,
                user_id=state["user_id"],
                conversation_id=state["conversation_id"],
                user_message=last_human.content,
                assistant_message=last_ai.content,
            )
        return {}

    async def _blocked_reply_node(self, state: AgentState) -> dict:
        personality: Personality = state["personality"]
        refusal = AIMessage(
            content=f"As {personality.name}, I can't help with that. Let's talk about something else within our conversation."
        )
        return {"messages": [refusal]}

    # -- Public API ------------------------------------------------------

    async def respond(self, *, thread_id: str, user_id: str, conversation_id: str, personality: Personality, user_message: str) -> str:
        result = await self._compiled.ainvoke(
            {
                "messages": [HumanMessage(content=user_message)],
                "user_id": user_id,
                "conversation_id": conversation_id,
                "personality": personality,
                "mode": "reply",
                "retry_count": 0,
            },
            config={"configurable": {"thread_id": thread_id}},
        )
        return result["messages"][-1].content

    async def initiate(self, *, thread_id: str, user_id: str, conversation_id: str, personality: Personality) -> str:
        result = await self._compiled.ainvoke(
            {
                "user_id": user_id,
                "conversation_id": conversation_id,
                "personality": personality,
                "mode": "proactive",
                "retry_count": 0,
            },
            config={"configurable": {"thread_id": thread_id}},
        )
        return result["messages"][-1].content
