# 🤖 Chatbot Project

A modular InfinitePay chatbot prototype, tailored for the InfinitePay platform (see [ajuda.infinitepay.io](https://ajuda.infinitepay.io/pt-BR/)), featuring specialized agents, platform-specific logic, basic security, and initial observability.

---

## 🚀 Quick Start

### Local Development
```bash
git clone https://github.com/ElderSam/chatbot.git
cd chatbot
```

**Choose your setup:**
- **🐳 Docker** (recommended): See [Infrastructure Guide](./infrastructure/README.md#-docker)
- **💻 Local Development**: See [Backend Setup](./backend/README.md)

### Production Deployment
- **☸️ Kubernetes**: See [Infrastructure Guide](./infrastructure/README.md#️-kubernetes)

> 💡 **Works without API keys** for testing. For full functionality, see [Backend Setup](./backend/README.md).

---

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

---

## 🏗️ What's Built

- **RouterAgent** → **KnowledgeAgent** + **MathAgent** → Specialized responses
- **Security**: Input sanitization, prompt injection prevention  
- **Observability**: Structured logs in Redis
- **Docker**: Containerized with health checks
- **Kubernetes**: Production-ready YAML manifests

---

## 📚 Documentation

- **[Backend Setup](./backend/README.md)** - API keys, local dev, testing
- **[Infrastructure Guide](./infrastructure/README.md)** - Docker & Kubernetes deployment
- **[Technical Architecture](./backend/docs/README.md)** - How agents work
- **[Documentation Hub](./docs/README.md)** - Complete documentation index

---

## 🛠️ Tech Stack

- **Backend**: NestJS (TypeScript)
- **LLM**: Groq (Llama 3.1)
- **Database**: Redis
- **Container**: Docker + Kubernetes
- **Testing**: Jest (76 tests passing)

---

**Status:** ✅ **Production Ready** | 🧪 **Fully Tested** | 🚀 **Cloud Native**
