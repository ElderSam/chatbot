# Chatbot Project

An intelligent chatbot system with modular agents, semantic search, and security features.

## �️ Project Structure

```
chatbot/
├── backend/          # NestJS API with intelligent agents
├── frontend/         # React frontend (coming soon)
├── docs/            # Project documentation
└── README.md        # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- API Keys (Groq, HuggingFace)

### Development Setup

1. **Clone and navigate:**
   ```bash
   git clone <repo>
   cd chatbot
   ```

2. **Backend setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env: Add your API keys
   
   docker compose up -d redis
   pnpm install
   pnpm tsx scripts/generate-embeddings.ts
   pnpm run start:dev
   ```

3. **Test the API:**
   ```bash
   curl -X POST http://localhost:3001/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Como acompanhar meu pedido?"}'
   ```

## 🧠 Architecture

The system uses intelligent agents to route and answer questions:

- **RouterAgent**: Determines which agent should handle each question
- **KnowledgeAgent**: Uses semantic search with LangChain + HuggingFace embeddings
- **MathAgent**: Solves mathematical expressions
- **Security Layer**: Input sanitization and prompt injection protection

## 📖 Documentation

### Project Overview
- **[📋 Challenge Requirements](./docs/challenge.md)** - Original project specifications
- **[📝 Tasks & Progress](./docs/tasks.md)** - Development tasks and status
- **[🛡️ Security Documentation](./docs/security/)** - Security features and implementation

### Backend Documentation
- **[⚙️ Backend Setup Guide](./backend/README.md)** - Complete backend setup and development
- **[🧠 Knowledge Agent System](./backend/docs/KNOWLEDGE_AGENT.md)** - AI agents and semantic search
- **[🔧 Scripts Usage](./backend/scripts/README.md)** - Utility scripts and embedding generation

### Frontend Documentation
- Frontend documentation will be available when the React frontend is implemented

## 🛠️ Development

### Backend
```bash
cd backend
pnpm run start:dev    # Development server
pnpm test            # Unit tests  
pnpm test:e2e        # Integration tests
```

### Frontend (Coming Soon)
The React frontend will be implemented as part of the complete chatbot solution.

## 🤝 Contributing

1. Follow the existing code structure
2. Run tests before submitting
3. Update documentation for new features
4. Follow security best practices

## 📄 License

See LICENSE file for details.
