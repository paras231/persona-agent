import logging
from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select

from app.agent.graph import AgentGraph
from app.agent.personality import Personality
from app.config import Settings, get_settings
from app.db.models import Conversation, Message
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)


class ProactiveMessenger:
    """Gives the agent self-texting capability: periodically scans for
    conversations that have gone quiet and lets the agent initiate a
    message on its own, without the user asking first."""

    def __init__(self, agent_graph: AgentGraph, settings: Settings | None = None) -> None:
        self._agent = agent_graph
        self._settings = settings or get_settings()
        self._scheduler = AsyncIOScheduler()

    def start(self) -> None:
        self._scheduler.add_job(
            self._check_inactive_conversations,
            "interval",
            seconds=self._settings.proactive_check_interval_seconds,
            id="proactive_messenger",
        )
        self._scheduler.start()

    def stop(self) -> None:
        self._scheduler.shutdown(wait=False)

    async def _check_inactive_conversations(self) -> None:
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=self._settings.proactive_inactivity_minutes)
        async with SessionLocal() as db:
            stmt = select(Conversation).where(Conversation.last_activity_at < cutoff)
            conversations = (await db.execute(stmt)).scalars().all()
            for conversation in conversations:
                await self.trigger(conversation.id)

    async def trigger(self, conversation_id: str) -> str | None:
        async with SessionLocal() as db:
            conversation = await db.get(Conversation, conversation_id)
            if conversation is None:
                return None
            await db.refresh(conversation, attribute_names=["personality"])
            personality = Personality(
                name=conversation.personality.name,
                role=conversation.personality.role,
                system_prompt=conversation.personality.system_prompt,
                traits=conversation.personality.traits,
            )

        try:
            reply = await self._agent.initiate(
                thread_id=conversation_id,
                user_id=conversation.user_id,
                conversation_id=conversation_id,
                personality=personality,
            )
        except Exception:
            logger.exception("Proactive message generation failed for conversation %s", conversation_id)
            return None

        async with SessionLocal() as db:
            db.add(Message(conversation_id=conversation_id, role="assistant", content=reply, is_proactive=True))
            conversation = await db.get(Conversation, conversation_id)
            conversation.last_activity_at = datetime.now(timezone.utc)
            await db.commit()
        return reply
