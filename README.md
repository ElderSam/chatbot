# 🤖 Chatbot Project

Simple modular chatbot prototype, featuring specialized agents, basic security, and initial observability.

## 🚀 Quick Start

### Docker (Local Development)

```bash
# 1. Clone and start
git clone <repository-url>
cd chatbot/backend
docker-compose up --build

# 2. Test
curl http://localhost:3000/health
```

**System available:** http://localhost:3000

### Kubernetes (Production)

```bash
# 1. Build Docker image
cd chatbot/backend
docker build -t chatbot-backend:latest .

# 2. Deploy to Kubernetes
cd k8s
kubectl apply -f .

# 3. Access via port-forward
kubectl port-forward svc/chatbot-backend 3000:3000 -n chatbot

# 4. Test
curl http://localhost:3000/health
```

> 💡 **Works without API keys** for testing. For full functionality, see [setup guide](./backend/README.md).

## 🏗️ What's Built

- **RouterAgent** → **KnowledgeAgent** + **MathAgent** → Specialized responses
- **Security**: Input sanitization, prompt injection prevention  
- **Observability**: Structured logs in Redis
- **Docker**: Containerized with health checks
- **Kubernetes**: Production-ready YAML manifests

## 📚 Documentation

- **[Development Setup](./backend/README.md)** - API keys, local dev, testing
- **[Kubernetes Deployment](./backend/k8s/README.md)** - Production deployment guide
- **[Technical Architecture](./backend/docs/README.md)** - How agents work
- **[Project Requirements](./docs/challenge.md)** - Original challenge

## 🏗️ Architecture Overview

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

### Deployment Options

- **🐳 Docker Compose**: Perfect for local development and testing
- **☸️ Kubernetes**: Production-ready with scaling, health checks, and ingress
- **🚀 Cloud**: Ready for deployment on any cloud provider

---
**Status:** ✅ Backend complete ✅ Kubernetes ready • 🚧 Frontend (React) coming soon 
