import logging

from langchain_core.messages import SystemMessage
from pydantic import BaseModel, Field

from app.llm.chat import ChatModelFactory

logger = logging.getLogger(__name__)

_CLASSIFIER_SYSTEM_PROMPT = """You are a memory-triage module for a conversational agent.
Given one exchange (user message + assistant reply), decide whether it contains
information worth remembering long-term about the user or the relationship
(facts, preferences, goals, recurring topics, emotionally significant events).

Do NOT flag small talk, greetings, filler, or anything only relevant to the
current turn. Be conservative: only store durable, reusable information.

Respond with the structured fields only."""


class MemoryDecision(BaseModel):
    should_store: bool = Field(description="Whether this exchange contains durable, reusable information")
    summary: str = Field(description="A short first-person-neutral summary of the fact to store, empty if should_store is False")
    importance: float = Field(description="0.0 (trivial) to 1.0 (critical) importance of this memory", ge=0.0, le=1.0)


class MemoryClassifier:
    """Decides which exchanges are promoted to long-term memory vs kept only
    in the short-term conversational window."""

    def __init__(self, chat_factory: ChatModelFactory | None = None) -> None:
        self._chat_factory = chat_factory or ChatModelFactory()
        self._model = self._chat_factory.build_structured(MemoryDecision)

    async def classify(self, user_message: str, assistant_message: str) -> MemoryDecision:
        exchange = f"User: {user_message}\nAssistant: {assistant_message}"
        messages = [SystemMessage(content=_CLASSIFIER_SYSTEM_PROMPT), SystemMessage(content=exchange)]
        try:
            decision = await self._model.ainvoke(messages)
            if decision is None:
                raise ValueError("Structured output returned None (model did not call the tool).")
            return decision
        except Exception:
            logger.exception("Memory classifier failed to parse a decision; skipping long-term storage for this exchange.")
            return MemoryDecision(should_store=False, summary="", importance=0.0)
