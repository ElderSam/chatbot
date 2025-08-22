# LangChain

LangChain is a library that simplifies building Retrieval-Augmented Generation (RAG) pipelines and integrations with LLMs, embeddings, and external sources.
In your project, LangChain can be used to:

Orchestrate semantic search: receive the question, retrieve embeddings (locally, via Redis, or Hugging Face API), calculate similarity, and return the most relevant article.
Integrate different embedding providers (local, API, etc.) seamlessly.
Compose the RAG pipeline: search, ranking, response generation, source logging, and execution time tracking.
Summary:
You can use LangChain to build the search and response pipeline, regardless of how embeddings are generated (locally, Docker, or Hugging Face API).
In other words, LangChain is the “orchestrator” of the RAG flow, and the embedding source can be any provider — including the Hugging Face API.