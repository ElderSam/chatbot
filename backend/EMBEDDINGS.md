
# Embeddings Workflow — Chatbot Backend

This document explains how to generate, update, and use article embeddings for the KnowledgeAgent using **LangChain with Hugging Face API**, keeping the backend lightweight and efficient.

## 1. Overview
- The backend uses **semantic search with embeddings** instead of keyword matching.
- **Hugging Face API** generates embeddings using the `sentence-transformers/all-MiniLM-L6-v2` model.
- Embeddings are cached in Redis for fast retrieval.
- The KnowledgeAgent uses **cosine similarity** to find the most relevant articles.

## 2. Setup

### Prerequisites
1. **Hugging Face API Key**: Get your free key at [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. **Redis running**: Make sure your Redis instance is accessible
3. **Environment variables**: Copy `.env.example` to `.env` and fill in your API key

### Environment Configuration
```bash
cp .env.example .env
# Edit .env and add your Hugging Face API key:
HUGGINGFACE_API_KEY=your_actual_api_key_here
```

## 3. How to Generate/Update Embeddings

### Step-by-step
1. **Update the article content** (if needed).
2. **Run the embedding generation script:**
   ```bash
   pnpm tsx scripts/generate-embeddings.ts
   ```
3. **Check in Redis:**
   - Embeddings are saved with keys like `cache:embedding:https://ajuda.infinitepay.io/...`
   - Each article has its embedding vector, title, and URL.

### Docker Alternative
If you prefer Docker:
1. **Build the Docker image:**
   ```bash
   docker build -t chatbot-backend .
   ```
2. **Run the embedding script:**
   ```bash
   docker run --rm --network=host -e HUGGINGFACE_API_KEY=your_key_here chatbot-backend pnpm tsx scripts/generate-embeddings.ts
   ```

## 4. How It Works

### Semantic Search Flow
1. User asks a question (e.g., "Qual a taxa da maquininha?")
2. System generates embedding for the question using Hugging Face API
3. Compares question embedding with stored article embeddings using cosine similarity
4. Returns the 3 most relevant articles based on semantic similarity
5. LLM generates natural response using the relevant context

### Benefits vs. Keyword Matching
- **Better relevance**: Finds articles even when exact words don't match
- **Semantic understanding**: "taxa da maquininha" matches "taxas do cartão" semantically
- **Consistent results**: Same quality regardless of keyword variations

## 5. Backend Integration
- The `EmbeddingService` handles all embedding operations
- `KnowledgeAgentService` automatically uses semantic search
- Fallback to dynamic loading if no embeddings are found
- All operations are logged with execution time and sources

## 6. API Limits & Costs
- **Free Tier**: ~1000 requests/month for embeddings
- **Light usage**: Perfect for testing and small-scale production
- **Batch processing**: Generate embeddings once, use many times
- **Efficient**: Only generates embeddings for new/updated articles

## 7. Troubleshooting
- **API errors**: Check your Hugging Face API key and rate limits
- **No results**: Run the embedding generation script to populate Redis
- **Performance**: Embeddings are cached, only API calls are for new content
- **Dependencies**: No complex local installations needed

---
This workflow provides intelligent, semantic search while maintaining simplicity and low resource usage in production.
