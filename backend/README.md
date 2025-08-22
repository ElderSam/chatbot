# Backend - NestJS Chatbot

> **🚀 For project overview, see the [main project README](../README.md)**

This is the backend service built with NestJS, featuring intelligent agents, semantic search, and security layers.

## 🎯 Quick Setup

### 1. API Keys Setup
```bash
cp .env.example .env
# Edit .env and add:
# GROQ_API_KEY=your_groq_key
# HUGGINGFACE_API_KEY=your_hf_key
```

Get API keys:
- **Groq**: https://console.groq.com → API Keys → Create API Key
- **HuggingFace**: https://huggingface.co/settings/tokens → New token

### 2. Start Services
```bash
# Start Redis
docker compose up -d redis

# Install dependencies
pnpm install

# Generate embeddings (first time only)
pnpm tsx scripts/generate-embeddings.ts

# Start development server
pnpm run start:dev
```

### 3. Test API
```bash
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Como acompanhar meu pedido?"}'
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests  
pnpm test:e2e

# Coverage
pnpm test:cov
```

## 🏗️ Architecture

Built with **NestJS** featuring:
- **RouterAgent**: Routes questions to appropriate agents
- **KnowledgeAgent**: Semantic search with LangChain + HuggingFace
- **MathAgent**: Mathematical expression solving
- **Redis**: Caching and conversation history
- **Security**: Input sanitization and prompt injection protection

## 📖 Backend Documentation

For detailed information, see:

- **[🧠 Knowledge Agent System](./docs/KNOWLEDGE_AGENT.md)** - AI agents and semantic search
- **[🔧 Scripts Usage](./scripts/README.md)** - Utility scripts
- **[💾 Redis Configuration](./docs/redis.md)** - Database setup
- **[🔧 Technical Implementation](./docs/EMBEDDINGS.md)** - Semantic search details
- **[🔗 LangChain Integration](./docs/LangChain.md)** - RAG pipeline concepts


