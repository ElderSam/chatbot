# 🤖 Chatbot Project

An intelligent modular chatbot with specialized agents, security, and observability.

## 🚀 Quick Start

```bash
# 1. Clone and navigate
git clone <repository-url>
cd chatbot/backend

# 2. Start with Docker
docker-compose up --build

# 3. Test the system
curl http://localhost:3000/health
```

**System available at:**
- Backend API: http://localhost:3000
- Redis: localhost:6379

> ⚠️ **API Keys needed for full functionality**: The chatbot works without API keys for testing, but you'll need [Groq](https://console.groq.com) + [HuggingFace](https://huggingface.co/settings/tokens) keys for LLM responses. See [backend setup](./backend/README.md) for details.

## 🏗️ Architecture

- **🔀 RouterAgent**: Routes messages to specialized agents
- **📚 KnowledgeAgent**: RAG-based search using InfinitePay documentation  
- **🧮 MathAgent**: Solves mathematical expressions
- **🔐 Security**: Input sanitization + prompt injection prevention
- **📊 Observability**: Structured logging in Redis

## 📖 Documentation

- **[ Backend Setup](./backend/README.md)** - Development guide
- **[� Project Challenge](./docs/challenge.md)** - Original requirements
- **[📚 Technical Details](./backend/docs/README.md)** - Architecture documentation

## 🎯 Project Status

✅ **Complete**: Backend API, Agents, Security, Observability, Docker  
🚧 **Next**: Frontend (React), Kubernetes, Cloud deployment

---
*For detailed setup and development, see [backend/README.md](./backend/README.md)*
