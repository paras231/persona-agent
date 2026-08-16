from langchain_ollama import ChatOllama
from pydantic import BaseModel

from app.config import Settings, get_settings


class ChatModelFactory:
    """Builds ChatOllama clients pointed at Ollama Cloud (gpt-oss-120b).

    No local inference or model downloads happen here: `base_url` targets
    the Ollama Cloud API and requests are authenticated via API key.
    """

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()

    def build(self, *, temperature: float | None = None, streaming: bool = False) -> ChatOllama:
        return ChatOllama(
            model=self._settings.ollama_model,
            base_url=self._settings.ollama_base_url,
            client_kwargs={
                "headers": {"Authorization": f"Bearer {self._settings.ollama_api_key}"},
            },
            temperature=temperature if temperature is not None else self._settings.llm_temperature,
            streaming=streaming,
        )

    def build_structured(self, schema: type[BaseModel], *, temperature: float = 0.0):
        # Tool-calling is the more reliable structured-output path for
        # gpt-oss through Ollama Cloud; plain JSON-schema-constrained
        # decoding has been flaky and throws OutputParserException on
        # malformed JSON.
        return self.build(temperature=temperature).with_structured_output(schema, method="function_calling")


_default_factory = ChatModelFactory()


def get_chat_model(**kwargs) -> ChatOllama:
    return _default_factory.build(**kwargs)
