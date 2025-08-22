
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

## 5. Implementation Details

### What Was Implemented
This implementation completely replaced the previous keyword-based search system with **semantic embeddings using LangChain and Hugging Face API**.

#### Key Components Added:
1. **EmbeddingService** (`src/agents/knowledge-agent/embedding.service.ts`):
   - Integrates with **Hugging Face API** using `sentence-transformers/all-MiniLM-L6-v2`
   - Generates embeddings via API (no complex local dependencies)
   - Intelligent Redis caching system
   - Semantic search with **cosine similarity** calculation

2. **Updated KnowledgeAgentService**:
   - Replaced keyword matching with **semantic search**
   - Smart fallback: automatically loads and generates embeddings for new content
   - Enhanced logging with embedding usage tracking
   - Better error handling and recovery

3. **Simplified Generation Script** (`scripts/generate-embeddings.ts`):
   - Uses Nest.js dependency injection for clean service access
   - Generates embeddings via Hugging Face API calls
   - No native dependencies or Docker complexity issues

4. **Environment Configuration**:
   - Added Hugging Face API key support in `.env`
   - Clear setup instructions and examples

### Key Benefits Over Previous System

#### ✅ **No Local Complexity**
- **Before**: Complex Docker setup, native dependencies (`sharp`), compilation issues
- **After**: Simple API calls, no local model installation required

#### ✅ **Intelligent Search**
- **Before**: Keyword matching only ("taxa da maquininha" wouldn't find "taxas do cartão")
- **After**: Semantic understanding finds conceptually related content regardless of exact wording

#### ✅ **Production Ready**
- **Before**: Heavy local processing, resource intensive
- **After**: Lightweight API calls, efficient Redis caching, perfect for cloud deployment

#### ✅ **Cost Effective**
- **Before**: Required dedicated resources for local model execution
- **After**: Free tier supports ~1000 requests/month, ideal for testing and light production use

#### ✅ **Maintainable**
- **Before**: Complex dependency management, environment-specific issues
- **After**: Simple API integration, consistent behavior across environments

### Architecture Changes

#### Previous Flow:
```
Question → Keyword splitting → Text search → Basic relevance filter → LLM
```

#### New Flow:
```
Question → Embedding generation (API) → Cosine similarity search → Top articles → LLM
```

## 6. Backend Integration
- The `EmbeddingService` handles all embedding operations
- `KnowledgeAgentService` automatically uses semantic search
- Fallback to dynamic loading if no embeddings are found
- All operations are logged with execution time and sources

## 6. Backend Integration
- The `EmbeddingService` handles all embedding operations
- `KnowledgeAgentService` automatically uses semantic search
- Fallback to dynamic loading if no embeddings are found
- All operations are logged with execution time and sources

## 7. How to Use - Complete Guide

### First-Time Setup
1. **Get your Hugging Face API key**:
   - Visit [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - Create a new token (free account is sufficient)
   
2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Add your API key to .env:
   HUGGINGFACE_API_KEY=hf_your_actual_key_here
   ```

3. **Start Redis** (if not already running):
   ```bash
   docker run -d -p 6379:6379 redis:alpine
   ```

4. **Generate initial embeddings**:
   ```bash
   pnpm tsx scripts/generate-embeddings.ts
   ```

5. **Start the backend**:
   ```bash
   pnpm start:dev
   ```

### Testing the Semantic Search
Try asking these questions to see the improved relevance:
- "Qual a taxa da maquininha?" (Portuguese)
- "What are the card machine fees?" (English)
- "Como receber pagamentos?" (Related concepts)

The system will now find semantically related articles even if exact words don't match.

### Updating Content
When articles are updated or new ones are added:
```bash
# Simply run the generation script again
pnpm tsx scripts/generate-embeddings.ts
```

## 8. API Limits & Costs
- **Free Tier**: ~1000 requests/month for embeddings
- **Light usage**: Perfect for testing and small-scale production
- **Batch processing**: Generate embeddings once, use many times
- **Efficient**: Only generates embeddings for new/updated articles

## 8. API Limits & Costs
- **Free Tier**: ~1000 requests/month for embeddings
- **Light usage**: Perfect for testing and small-scale production
- **Batch processing**: Generate embeddings once, use many times
- **Efficient**: Only generates embeddings for new/updated articles

## 9. Troubleshooting
- **API errors**: Check your Hugging Face API key and rate limits
- **No results**: Run the embedding generation script to populate Redis
- **Performance**: Embeddings are cached, only API calls are for new content
- **Dependencies**: No complex local installations needed

## 10. Monitoring & Metrics
The system provides comprehensive logging for monitoring:

### Logged Information
- **Execution time**: How long each search takes
- **Source articles**: Which articles were used for the response
- **Embedding usage**: Whether semantic search was used or fallback
- **API calls**: Track Hugging Face API usage
- **Cache hits**: Monitor Redis cache effectiveness

### Example Log Output
```json
{
  "timestamp": "2025-08-21T14:32:12Z",
  "level": "INFO",
  "agent": "KnowledgeAgent",
  "question": "Qual a taxa da maquininha?",
  "sources": ["https://ajuda.infinitepay.io/..."],
  "executionTimeMs": 850,
  "usedEmbeddings": true
}
```

---

## ✅ **Complete Implementation Status**

This document covers the **complete implementation** of:
- LangChain integration with Hugging Face API
- Semantic search replacing keyword matching
- Production-ready caching and error handling
- Simple deployment without complex dependencies
- Comprehensive monitoring and logging

The system now provides **intelligent, contextual responses** while maintaining **simplicity and cost-effectiveness** for deployment.
