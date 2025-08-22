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


## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
