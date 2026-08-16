import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.agent.graph import AgentGraph
from app.agent.proactive import ProactiveMessenger
from app.api.routes import router
from app.db.models import Base
from app.db.session import engine

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)

    agent_graph = AgentGraph()
    await agent_graph.setup()
    app.state.agent_graph = agent_graph

    proactive_messenger = ProactiveMessenger(agent_graph)
    proactive_messenger.start()
    app.state.proactive_messenger = proactive_messenger

    yield

    proactive_messenger.stop()
    await agent_graph.aclose()


app = FastAPI(title="AI Agent - Personality Conversationalist", lifespan=lifespan)

# No auth in this app -- the client identifies itself with a locally generated
# user id, so any origin can be allowed to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
