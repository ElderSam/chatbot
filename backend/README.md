# Backend - NestJS Chatbot

> **🔼 For project overview, see [main README](../README.md)**

## 🚀 Development Setup

### Option 1: Docker (Recommended)

**Quick start without API keys:**
```bash
docker-compose up --build
# System starts but LLM features won't work without API keys
```

**With API keys (for full functionality):**
```bash
# Method A: Create .env.production file
cp .env.production.example .env.production
# Edit .env.production and add your real API keys

# Method B: Or set environment variables directly
export GROQ_API_KEY=your_actual_groq_key
export HUGGINGFACE_API_KEY=your_actual_hf_key
docker-compose up --build
```

### Option 2: Local Development
```bash
# 1. Setup API keys
cp .env.example .env
# Add your GROQ_API_KEY and HUGGINGFACE_API_KEY

# 2. Start Redis
docker-compose up redis -d

# 3. Install and run
pnpm install
pnpm run embeddings  # First time only
pnpm run start:dev
```

## 🧪 Testing & Development

```bash
# Tests
pnpm test              # Unit tests
pnpm test:e2e          # E2E tests  
pnpm test:cov          # Coverage

# API Test
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Como acompanhar meu pedido?", "user_id": "test", "conversation_id": "conv-1"}'
```

## 📖 Technical Documentation

**[📚 Documentation Index](./docs/README.md)** - Complete technical documentation

Quick links:
- **[🧠 Agent System](./docs/KNOWLEDGE_AGENT.md)** - How agents work
- **[📊 Observability](./docs/OBSERVABILITY_IMPLEMENTATION.md)** - Logging system  
- **[🔧 Embeddings](./docs/EMBEDDINGS.md)** - Semantic search details

## 🏗️ Architecture

```
src/
├── agents/          # RouterAgent, KnowledgeAgent, MathAgent
├── chat/           # API controllers and DTOs  
├── redis/          # Cache and logging services
└── common/         # Shared utilities
```

**Development Guides:**
- **[⚙️ Scripts](./scripts/README.md)** - Utility scripts
- **[🧪 Testing](./test/README.md)** - Test patterns

---
*API Keys required: [Groq](https://console.groq.com) + [HuggingFace](https://huggingface.co/settings/tokens)*
