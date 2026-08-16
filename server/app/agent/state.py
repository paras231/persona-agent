from typing import Annotated, Literal, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from app.agent.personality import Personality


class AgentState(TypedDict, total=False):
    messages: Annotated[list[BaseMessage], add_messages]
    user_id: str
    conversation_id: str
    personality: Personality
    mode: Literal["reply", "proactive"]

    retrieved_memories: list[str]
    blocked: bool
    block_reason: str
    retry_count: int
    final_reply: str
