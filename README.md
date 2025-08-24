# 🤖 Chatbot Project

Simple modular chatbot prototype, featuring specialized agents, basic security, and initial observability.

## 🚀 Quick Start

```bash
# 1. Clone and start
git clone <repository-url>
cd chatbot/backend
docker-compose up --build

# 2. Test
curl http://localhost:3000/health
```

**System available:** http://localhost:3000

> 💡 **Works without API keys** for testing. For full functionality, see [setup guide](./backend/README.md).

## 🏗️ What's Built

- **RouterAgent** → **KnowledgeAgent** + **MathAgent** → Specialized responses
- **Security**: Input sanitization, prompt injection prevention  
- **Observability**: Structured logs in Redis
- **Docker**: Containerized with health checks

## 📚 Documentation

- **[Development Setup](./backend/README.md)** - API keys, local dev, testing
- **[Technical Architecture](./backend/docs/README.md)** - How agents work
- **[Project Requirements](./docs/challenge.md)** - Original challenge

---
**Status:** ✅ Backend complete • 🚧 Frontend (React) + K8s coming soon
