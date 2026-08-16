from huggingface_hub import InferenceClient

from app.config import Settings, get_settings


class EmbeddingService:
    """Generates text embeddings via Hugging Face's cloud Inference API.

    Intentionally uses the hosted Inference API only -- no `transformers`
    and no local model weights are downloaded or run on this machine.
    """

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._client = InferenceClient(
            model=self._settings.hf_embedding_model,
            token=self._settings.hf_api_token,
            # Pin to the classic serverless Inference API explicitly. With
            # provider="auto" (the default), huggingface_hub routes through
            # its newer multi-provider marketplace, which doesn't reliably
            # serve arbitrary sentence-transformers models from the Hub.
            provider="hf-inference",
        )

    def embed_text(self, text: str) -> list[float]:
        vector = self._client.feature_extraction(text)
        return self._to_flat_list(vector)

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        return [self.embed_text(text) for text in texts]

    @staticmethod
    def _to_flat_list(vector) -> list[float]:
        # HF feature-extraction can return a nested list (tokens x dims);
        # mean-pool to a single sentence-level embedding when needed.
        data = vector.tolist() if hasattr(vector, "tolist") else vector
        if data and isinstance(data[0], list):
            dims = len(data[0])
            sums = [0.0] * dims
            for row in data:
                for i, value in enumerate(row):
                    sums[i] += value
            return [value / len(data) for value in sums]
        return data
