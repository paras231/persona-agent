from datetime import datetime

from pydantic import BaseModel, Field


class PersonalityCreate(BaseModel):
    user_id: str
    name: str
    role: str
    system_prompt: str
    traits: dict = Field(default_factory=dict)


class PersonalityOut(BaseModel):
    id: str
    user_id: str
    name: str
    role: str
    system_prompt: str
    traits: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationCreate(BaseModel):
    user_id: str
    personality_id: str


class ConversationOut(BaseModel):
    id: str
    user_id: str
    personality_id: str
    created_at: datetime
    last_activity_at: datetime

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    content: str


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    is_proactive: bool
    created_at: datetime

    model_config = {"from_attributes": True}
