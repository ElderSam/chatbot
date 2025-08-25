# 🤖 Chatbot Project

A modular InfinitePay chatbot prototype, tailored for the InfinitePay platform (see [ajuda.infinitepay.io](https://ajuda.infinitepay.io/pt-BR/)), featuring specialized agents, platform-specific logic, basic security, and initial observability.

---

## 📋 Quick Reference

### 1. 🐳 How to run locally (Docker)
See [Infrastructure Guide - Docker](./infrastructure/README.md#-docker) for complete setup commands.

### 2. ☸️ How to run on Kubernetes
See [Infrastructure Guide - Kubernetes](./infrastructure/README.md#️-kubernetes) for deployment steps.

### 3. 🏗️ Architecture (Router, Agents, Logs, Redis)
See [Backend Setup - System Architecture](./backend/README.md#️-system-architecture) for complete architecture diagram and component details.

### 4. 💻 Frontend access
Frontend not yet implemented. Use API directly: `POST /chat` with `{"message": "...", "user_id": "...", "conversation_id": "..."}`

### 5. 📊 Example logs (JSON)
See [Backend Setup](./backend/README.md#-api-examples--logs) for complete request/response/log examples.

### 6. 🔐 Security implementation
- **Input sanitization**: HTML/JS removal via `SanitizePipe`
- **Prompt injection**: Pattern blocking via `PromptGuardService`  
- **Details**: [Security Guide](./docs/security/input_sanitization.md)

### 7. 🧪 How to run tests (backend)
See [Backend Setup](./backend/README.md#-testing) for test commands and coverage details.

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

## 🏗️ What's Built

- **RouterAgent** → **KnowledgeAgent** + **MathAgent** → Specialized responses
- **Security**: Input sanitization, prompt injection prevention  
- **Observability**: Structured logs in Redis
- **Docker**: Containerized with health checks
- **Kubernetes**: Production-ready YAML manifests

---

## 📚 Documentation

- **[Backend Setup](./backend/README.md)** - API keys, local dev, testing, architecture
- **[Infrastructure Guide](./infrastructure/README.md)** - Docker & Kubernetes deployment
- **[Documentation Hub](./docs/README.md)** - Complete documentation index

---

## 🛠️ Tech Stack

- **Backend**: NestJS (TypeScript)
- **LLM**: Groq (Llama 3.1) + HuggingFace (Embeddings)
- **Database**: Redis
- **Container**: Docker + Kubernetes
- **Testing**: Jest (76 tests passing)

---

**Status:** ✅ **Production Ready** | 🧪 **Main features Tested** | 🚀 **Cloud Native**
