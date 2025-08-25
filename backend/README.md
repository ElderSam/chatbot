# Backend Setup

> **Already ran the quick start?** → Skip to [API Keys Setup](#-api-keys-for-full-functionality)

## 🔑 API Keys for Full Functionality

```bash
# Copy and edit with your real keys
cp config/env/.env.example config/env/.env
```

**Get keys:**
- [Groq API](https://console.groq.com) (required - free tier: 30 req/min)  
- [HuggingFace](https://huggingface.co/settings/tokens) (optional - free tier: 1000 req/month)

> See [config/env/README.md](./config/env/README.md) for all environment variables.

## 🛠️ Local Development (Without Docker)

**Prefer Docker?** → See [Infrastructure Guide](../infrastructure/README.md)

Instead of Docker, run locally:

```bash
# 1. Start Redis only
cd ../infrastructure/docker
docker-compose up redis -d

# 2. Install and run (from backend/)
pnpm install

# 3. ⚠️ FIRST: Generate embeddings for KnowledgeAgent
# See scripts/README.md for details
pnpm run embeddings

pnpm run start:dev    # Runs on port 3000
```

> **⚠️ Important:** Before starting the backend, see [scripts/README.md](./scripts/README.md) for required setup steps.

## 🧪 Testing

```bash
pnpm test        # Unit tests
pnpm test:e2e    # E2E tests
pnpm test:cov    # Coverage report
```

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   RouterAgent   │────│  KnowledgeAgent  │    │   MathAgent     │
│                 │    │                  │    │                 │
│ • Route logic   │    │ • RAG with docs  │    │ • Math parsing  │
│ • Input guard   │    │ • Embeddings     │    │ • LLM compute   │
│ • Structured    │    │ • Context search │    │ • Expressions   │
│   logging       │    │ • Source citing  │    │ • Calculations  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         └────────────────────────┼───────────────────────┘
                                  │
                         ┌─────────────────┐
                         │ Redis (Logs &   │
                         │ Cache Storage)  │
                         └─────────────────┘
```

**Flow:** Chat Request → RouterAgent → KnowledgeAgent/MathAgent → Response  
**Observability:** All interactions logged as structured JSON in Redis

### Agent Components
- **🧠 RouterAgent**: Decision logic + input validation + structured logging
- **🔍 KnowledgeAgent**: RAG system with HuggingFace embeddings + cosine similarity search  
- **🧮 MathAgent**: LLM-powered mathematical expression parsing and calculations
- **💾 Redis**: Cache storage + structured JSON logs for observability

**Technical details:** See [docs/KNOWLEDGE_AGENT.md](./docs/KNOWLEDGE_AGENT.md), [docs/EMBEDDINGS.md](./docs/EMBEDDINGS.md), [docs/OBSERVABILITY_IMPLEMENTATION.md](./docs/OBSERVABILITY_IMPLEMENTATION.md)

**Technical details:** See [docs/README.md](./docs/README.md)

---

## 📊 API Examples & Logs

### Example Request
```bash
curl -X POST http://localhost:3003/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the card machine fees?", "user_id": "client123", "conversation_id": "conv-456"}'
```

### Example Response
```json
{
  "response": "A taxa da maquininha InfinitePay varia conforme o plano...",
  "source_agent_response": "Based on InfinitePay documentation, the fees are...",
  "agent_workflow": [
    { "agent": "RouterAgent", "decision": "KnowledgeAgent" },
    { "agent": "KnowledgeAgent" }
  ]
}
```

### Structured Logs Generated
```json
// RouterAgent decision
{
  "timestamp": "2025-08-24T15:30:12.435Z",
  "level": "INFO",
  "agent": "RouterAgent",
  "conversation_id": "conv-456",
  "user_id": "client123",
  "message": "What are the card machine fees?",
  "decision": "KnowledgeAgent",
  "execution_time": 45
}

// KnowledgeAgent processing
{
  "timestamp": "2025-08-24T15:30:12.580Z",
  "level": "INFO", 
  "agent": "KnowledgeAgent",
  "conversation_id": "conv-456",
  "user_id": "client123",
  "question": "What are the card machine fees?",
  "sources": ["https://ajuda.infinitepay.io/..."],
  "execution_time": 320,
  "usedEmbeddings": true
}

// Math example  
{
  "timestamp": "2025-08-24T15:32:15.123Z",
  "level": "INFO",
  "agent": "MathAgent", 
  "conversation_id": "conv-789",
  "user_id": "client456",
  "message": "How much is 2+2?",
  "responseMsg": "4",
  "execution_time": 180
}
```

---
