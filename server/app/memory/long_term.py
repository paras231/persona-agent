from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import LongTermMemory
from app.llm.embeddings import EmbeddingService


@dataclass
class RetrievedMemory:
    content: str
    importance: float
    distance: float


class LongTermMemoryStore:
    """Persists and retrieves durable memories using pgvector similarity search."""

    def __init__(self, embedding_service: EmbeddingService | None = None) -> None:
        self._embeddings = embedding_service or EmbeddingService()

    async def save(
        self,
        db: AsyncSession,
        *,
        user_id: str,
        conversation_id: str,
        content: str,
        importance: float,
    ) -> LongTermMemory:
        embedding = self._embeddings.embed_text(content)
        memory = LongTermMemory(
            user_id=user_id,
            conversation_id=conversation_id,
            content=content,
            importance=importance,
            embedding=embedding,
        )
        db.add(memory)
        await db.commit()
        await db.refresh(memory)
        return memory

    async def search(
        self,
        db: AsyncSession,
        *,
        user_id: str,
        query: str,
        top_k: int = 5,
    ) -> list[RetrievedMemory]:
        query_embedding = self._embeddings.embed_text(query)
        distance = LongTermMemory.embedding.cosine_distance(query_embedding)
        stmt = (
            select(LongTermMemory, distance.label("distance"))
            .where(LongTermMemory.user_id == user_id)
            .order_by(distance)
            .limit(top_k)
        )
        rows = (await db.execute(stmt)).all()
        return [
            RetrievedMemory(content=row.LongTermMemory.content, importance=row.LongTermMemory.importance, distance=row.distance)
            for row in rows
        ]
