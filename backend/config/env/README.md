# Environment Configuration

## Setup

```bash
# Copy template
cp config/env/.env.example config/env/.env

# Edit with your API keys
nano config/env/.env
```

## Required Variables

```bash
# LLM (Required for full functionality)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx

# Embeddings (Optional - has fallback)
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx

# Database
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
NODE_ENV=development
PORT=3000
```
