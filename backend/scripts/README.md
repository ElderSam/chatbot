# Scripts Folder

This folder contains utility scripts for the knowledge-agent system.

## 📜 Available Scripts

### `generate-embeddings.ts`

**Purpose:** Standalone script to generate and cache semantic embeddings for articles.

**When to use:**
- 🚀 **Initial setup** - Generate embeddings for the first time
- 🔄 **Maintenance** - Regenerate embeddings after content updates  
- 🐛 **Debug** - Test embedding generation independently of the main app
- 📊 **Batch processing** - Process large sets of articles efficiently

**Usage:**
```bash
pnpm tsx scripts/generate-embeddings.ts
```

**Features:**
- ✅ Optimized processing (5 articles for testing)
- ✅ Detailed progress logging with emojis
- ✅ Manual .env loading (works outside Nest.js context)
- ✅ Redis caching integration
- ✅ HuggingFace API integration
- ✅ Error handling and timeouts
- ✅ Parallel processing (batches of 3)

**Configuration:**
- Uses environment variables from `.env` file
- Requires `HUGGINGFACE_API_KEY`
- Connects to Redis for caching

**Output:**
Generates embeddings and stores them in Redis with keys like:
- `cache:embedding:https://ajuda.infinitepay.io/...`
- `cache:processed_articles:quick` (for faster subsequent loads)

## 🗑️ Cache Management

Instead of a separate script, use Redis CLI commands:

```bash
# Clear all embedding cache
redis-cli --pattern "cache:embedding:*" --eval "redis.call('del', unpack(redis.call('keys', ARGV[1])))" , "cache:embedding:*"

# Clear quick cache
redis-cli DEL "cache:processed_articles:quick"

# Clear all cache
redis-cli FLUSHDB
```

## 🔧 Development Notes

- Scripts run **outside** Nest.js context
- Must handle environment loading manually
- Use `SimpleCacheService` for Redis interaction
- Target collection 7 (Sua Maquininha) for optimization
