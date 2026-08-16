Build an AI Agent that talks to people according to defined personality

<!-- Features requirements -->
1. user can define personality of Agent (teacher , role play , interviewer etc)
2. Agent must have memory to remember only key conversations
3. agent can initialize the conversation if not explicitly initiated by user. (self texting capability)
4. Agent must always act according to defined personality no extra conversations.
5. force model to be verbose and good at conversations


<!-- Technical Specifications -->
1. use langchain + langgraph for agent
2. use appropriate langgraph functions for memeory management
3. build a memory manager that manages long + short term memories
4. build a layer which identifies which memory needs to be saved in long term memory vs short term context only
5. use a dockerfile and write clean requirements.txt without package versions
6. use postgres and pgvector if needed for memory or anything .
7. use hugging face cloud inference for embeddings if needed
8. use ollama cloud with gpt-oss-120b model
9. Do not perform any local model download or any use of transformers for local models.
10. Follow clean python OOPs concepts
11. use proper guardrails whenever possible for agent.
