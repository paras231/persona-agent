from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.graph import AgentGraph
from app.agent.personality import Personality
from app.agent.proactive import ProactiveMessenger
from app.api.schemas import (
    ConversationCreate,
    ConversationOut,
    MessageCreate,
    MessageOut,
    PersonalityCreate,
    PersonalityOut,
)
from app.db.models import Conversation, Message, Personality as PersonalityModel
from app.db.session import get_db

router = APIRouter()


def get_agent_graph(request: Request) -> AgentGraph:
    return request.app.state.agent_graph


def get_proactive_messenger(request: Request) -> ProactiveMessenger:
    return request.app.state.proactive_messenger


@router.post("/personalities", response_model=PersonalityOut)
async def create_personality(payload: PersonalityCreate, db: AsyncSession = Depends(get_db)) -> PersonalityModel:
    personality = PersonalityModel(**payload.model_dump())
    db.add(personality)
    await db.commit()
    await db.refresh(personality)
    return personality


@router.get("/personalities/{personality_id}", response_model=PersonalityOut)
async def get_personality(personality_id: str, db: AsyncSession = Depends(get_db)) -> PersonalityModel:
    personality = await db.get(PersonalityModel, personality_id)
    if personality is None:
        raise HTTPException(status_code=404, detail="Personality not found")
    return personality


@router.post("/conversations", response_model=ConversationOut)
async def create_conversation(payload: ConversationCreate, db: AsyncSession = Depends(get_db)) -> Conversation:
    personality = await db.get(PersonalityModel, payload.personality_id)
    if personality is None:
        raise HTTPException(status_code=404, detail="Personality not found")
    conversation = Conversation(user_id=payload.user_id, personality_id=payload.personality_id)
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageOut])
async def list_messages(conversation_id: str, db: AsyncSession = Depends(get_db)) -> list[Message]:
    stmt = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at)
    return list((await db.execute(stmt)).scalars().all())


@router.post("/conversations/{conversation_id}/messages", response_model=MessageOut)
async def send_message(
    conversation_id: str,
    payload: MessageCreate,
    db: AsyncSession = Depends(get_db),
    agent_graph: AgentGraph = Depends(get_agent_graph),
) -> Message:
    conversation = await db.get(Conversation, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    personality_model = await db.get(PersonalityModel, conversation.personality_id)

    user_message = Message(conversation_id=conversation_id, role="user", content=payload.content)
    db.add(user_message)
    conversation.last_activity_at = datetime.now(timezone.utc)
    await db.commit()

    personality = Personality(
        name=personality_model.name,
        role=personality_model.role,
        system_prompt=personality_model.system_prompt,
        traits=personality_model.traits,
    )
    reply_text = await agent_graph.respond(
        thread_id=conversation_id,
        user_id=conversation.user_id,
        conversation_id=conversation_id,
        personality=personality,
        user_message=payload.content,
    )

    assistant_message = Message(conversation_id=conversation_id, role="assistant", content=reply_text)
    db.add(assistant_message)
    conversation.last_activity_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(assistant_message)
    return assistant_message


@router.post("/conversations/{conversation_id}/proactive", response_model=MessageOut | None)
async def trigger_proactive_message(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    proactive_messenger: ProactiveMessenger = Depends(get_proactive_messenger),
):
    conversation = await db.get(Conversation, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    reply_text = await proactive_messenger.trigger(conversation_id)
    if reply_text is None:
        raise HTTPException(status_code=500, detail="Failed to generate proactive message")

    stmt = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.desc())
    return (await db.execute(stmt)).scalars().first()
