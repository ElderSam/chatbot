# 🤖 Chatbot Project

Simple modular chatbot prototype, featuring specialized agents, basic security, and initial observability.

## 🚀 Quick Start

### Local Development
```bash
git clone <repository-url>
cd chatbot
```

**Choose your setup:**
- **🐳 Docker** (recommended): See [Infrastructure Guide](./infrastructure/README.md#-docker)
- **💻 Local Development**: See [Backend Setup](./backend/README.md)

### Production Deployment
- **☸️ Kubernetes**: See [Infrastructure Guide](./infrastructure/README.md#️-kubernetes)

> 💡 **Works without API keys** for testing. For full functionality, see [Backend Setup](./backend/README.md).

## 🏗️ What's Built

- **RouterAgent** → **KnowledgeAgent** + **MathAgent** → Specialized responses
- **Security**: Input sanitization, prompt injection prevention  
- **Observability**: Structured logs in Redis
- **Docker**: Containerized with health checks
- **Kubernetes**: Production-ready YAML manifests

## 📚 Documentation

- **[Development Setup](./backend/README.md)** - API keys, local dev, testing
- **[Infrastructure Guide](./infrastructure/README.md)** - Docker & Kubernetes deployment
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

See detailed deployment guides in [Infrastructure Documentation](./infrastructure/README.md):
- **🐳 Docker Compose** - Local development and testing
- **☸️ Kubernetes** - Production with scaling and health checks
- **🚀 Cloud Ready** - Works on any cloud provider

---
**Status:** ✅ Backend complete ✅ Kubernetes ready • 🚧 Frontend (React) coming soon 
