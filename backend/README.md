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
pnpm run embeddings  # First time only - generates search data
pnpm run start:dev    # Runs on port 3000
```

## 🧪 Testing

```bash
pnpm test        # Unit tests
pnpm test:e2e    # E2E tests
pnpm test:cov    # Coverage report
```

## 📊 System Architecture

```
Chat Request → RouterAgent → KnowledgeAgent/MathAgent → Response
                    ↓              ↓           ↓
                 Redis Logs → Observability
```

**Technical details:** See [docs/README.md](./docs/README.md)

---
**Quick test:** `curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" -d '{"message": "How much is 2+2?", "user_id": "test", "conversation_id": "123"}'`
