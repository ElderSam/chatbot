# 🧠 Knowledge Agent System - Developer Guide

## 🎯 Overview

The Knowledge Agent uses **semantic search with LangChain + HuggingFace** to provide intelligent answers from InfinitePay's help articles. It replaces keyword-based search with AI embeddings for better relevance.

## 📁 File Structure & Relationships

### Core Components
```
backend/
├── scripts/                           # 🔧 UTILITY SCRIPTS
│   ├── generate-embeddings.ts        # Generates embeddings for articles
│   └── README.md                     # When to use scripts
└── src/agents/knowledge-agent/       # 🧠 CORE AI SYSTEM
    ├── embedding.service.ts          # HuggingFace API integration
    ├── context-loader.ts             # Loads articles from web
    ├── knowledge-agent.service.ts    # Main agent logic
    └── types.ts                      # Shared TypeScript types
```

### How They Work Together

#### 🔄 **Data Flow:**
```
1. [Scripts] generate-embeddings.ts → Loads articles → Generates embeddings → Redis
2. [Service] embedding.service.ts → Reads from Redis → Semantic search
3. [Service] knowledge-agent.service.ts → Uses embeddings → Answers questions
```

#### 🏗️ **Dependency Chain:**
```
knowledge-agent.service.ts
    ↓ depends on
embedding.service.ts + context-loader.ts
    ↓ uses data from
generate-embeddings.ts (via Redis)
```

## 🚀 How It Works

### 1. **Initial Setup** (Run Once)
```bash
# Generate embeddings for the first time
pnpm tsx scripts/generate-embeddings.ts
```
**What happens:**
- `generate-embeddings.ts` loads articles from InfinitePay help site
- Sends each article to HuggingFace API for embedding generation
- Stores embeddings in Redis with keys like `cache:embedding:https://ajuda.infinitepay.io/...`

### 2. **Runtime** (Every Question)
```bash
# User asks: "Como acompanhar meu pedido?"
curl -X POST http://localhost:3001/chat -d '{"message": "Como acompanhar meu pedido?"}'
```
**What happens:**
- `knowledge-agent.service.ts` receives the question
- `embedding.service.ts` generates embedding for the question
- Compares with cached article embeddings using cosine similarity
- Returns top 3 most relevant articles
- LLM generates natural response using context

### 3. **Maintenance** (As Needed)
```bash
# When InfinitePay updates their help articles
redis-cli DEL "cache:processed_articles:quick"
pnpm tsx scripts/generate-embeddings.ts
```

## 🔧 Key Components Explained

### `scripts/generate-embeddings.ts`
**Purpose:** Standalone script for embedding generation
**When to use:** [See scripts/README.md](../backend/scripts/README.md)
```typescript
// Loads Nest.js services independently
// Processes articles in parallel
// Handles API rate limits
// Stores embeddings in Redis
```

### `embedding.service.ts`
**Purpose:** HuggingFace API integration
**Used by:** knowledge-agent.service.ts
```typescript
// generateEmbedding(text) → calls HuggingFace API
// findMostRelevantArticles(question) → semantic search
// cosineSimilarity(a, b) → similarity calculation
```

### `context-loader.ts`
**Purpose:** Web scraping and article processing
**Used by:** Both scripts and services
```typescript
// loadProcessedArticles() → scrapes InfinitePay help site
// Optimized for collection 7 (Sua Maquininha)
// Quick cache for 20x performance improvement
```

### `knowledge-agent.service.ts`
**Purpose:** Main agent orchestration
**Entry point:** Chat API `/chat` endpoint
```typescript
// answer(message) → main entry point
// Uses embedding search first
// Falls back to context loading if needed
// Integrates with GroqService for LLM responses
```

## 🔍 Developer Workflow

### **Understanding the System**
For setup, see [../README.md](../README.md). This doc covers **how the code works**.

### **Key Files & Their Purpose**

### **When Things Go Wrong**
```bash
# Semantic search not working?
redis-cli KEYS "cache:embedding:*" | wc -l  # Should show many keys

# Poor results?
pnpm tsx scripts/generate-embeddings.ts     # Regenerate embeddings

# Redis empty?
docker compose up -d redis                  # Restart Redis
pnpm tsx scripts/generate-embeddings.ts     # Regenerate data
```

## 🧪 Testing

### **Unit Tests**
```bash
pnpm test agents/knowledge-agent
# Tests: embedding.service.spec.ts, knowledge-agent.service.spec.ts, context-loader.spec.ts
```

### **Integration Tests**
```bash
pnpm test:e2e
# Tests: Full workflow from question to answer
```

### **Manual Testing**
```bash
# Test semantic search
curl -X POST http://localhost:3001/chat -d '{"message": "taxa maquininha"}'
curl -X POST http://localhost:3001/chat -d '{"message": "acompanhar pedido"}'
curl -X POST http://localhost:3001/chat -d '{"message": "problemas entrega"}'
```

## 🚨 Common Issues

### **"No embeddings found"**
**Cause:** Scripts never run or Redis cleared
**Solution:** `pnpm tsx scripts/generate-embeddings.ts`

### **"Poor semantic search results"**
**Cause:** Outdated embeddings
**Solution:** Clear cache and regenerate
```bash
redis-cli DEL "cache:processed_articles:quick"
pnpm tsx scripts/generate-embeddings.ts
```

### **"HuggingFace API errors"**
**Cause:** Missing or invalid API key
**Solution:** Check `config/env/.env` file has valid `HUGGINGFACE_API_KEY`

### **"Scripts taking too long"**
**Cause:** Processing all collections instead of optimized subset
**Solution:** Current version targets collection 7 (optimized). If still slow, check Redis connection.

## 🎯 Key Benefits

### **vs Keyword Search:**
- ✅ **Semantic understanding**: "taxa" finds "taxas", "custo", "valor"
- ✅ **Context aware**: "problemas entrega" matches "dificuldades recebimento"
- ✅ **Language flexible**: Works with typos and variations

### **vs Local Models:**
- ✅ **No Docker complexity**: Simple API calls
- ✅ **No native dependencies**: No compilation issues
- ✅ **Production ready**: Reliable cloud API
- ✅ **Fast startup**: No model loading time

### **Performance:**
- ⚡ **Context loading**: 48ms (20x improvement)
- ⚡ **Semantic search**: <100ms typical response
- 📦 **Memory efficient**: Embeddings cached in Redis, not memory
