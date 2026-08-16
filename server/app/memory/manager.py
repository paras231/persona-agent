from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.db.models import Message
from app.memory.classifier import MemoryClassifier
from app.memory.long_term import LongTermMemoryStore, RetrievedMemory


class MemoryManager:
    """Coordinates short-term (recent turns) and long-term (pgvector) memory.

    Short-term memory is the rolling window of recent messages for a
    conversation -- cheap, always available, no judgement required.
    Long-term memory is durable and cross-conversation; a `MemoryClassifier`
    decides what is worth promoting into it after each exchange.
    """

    def __init__(
        self,
        settings: Settings | None = None,
        long_term_store: LongTermMemoryStore | None = None,
        classifier: MemoryClassifier | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._long_term = long_term_store or LongTermMemoryStore()
        self._classifier = classifier or MemoryClassifier()

    async def get_short_term_context(self, db: AsyncSession, *, conversation_id: str) -> list[Message]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(self._settings.short_term_window)
        )
        messages = (await db.execute(stmt)).scalars().all()
        return list(reversed(messages))

    async def retrieve_long_term(self, db: AsyncSession, *, user_id: str, query: str) -> list[RetrievedMemory]:
        return await self._long_term.search(db, user_id=user_id, query=query, top_k=self._settings.long_term_top_k)

    async def consider_and_store(
        self,
        db: AsyncSession,
        *,
        user_id: str,
        conversation_id: str,
        user_message: str,
        assistant_message: str,
    ) -> bool:
        """Runs the exchange through the classifier and persists it to long-term
        memory only if it clears the importance threshold. Returns whether it stored."""
        decision = await self._classifier.classify(user_message, assistant_message)
        if not decision.should_store or decision.importance < self._settings.memory_importance_threshold:
            return False
        await self._long_term.save(
            db,
            user_id=user_id,
            conversation_id=conversation_id,
            content=decision.summary,
            importance=decision.importance,
        )
        return True
