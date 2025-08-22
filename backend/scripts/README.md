# Scripts Folder

This folder contains utility scripts for the knowledge-agent system.

## 📜 Available Scripts

### `generate-embeddings.ts`

**Purpose:** Standalone script to generate and cache semantic embeddings for articles.

## 🎯 When Should You Run This Script?

### **REQUIRED - First Time Setup** 🚀
**Scenario:** You just cloned the project or set up a new environment
**Why:** The semantic search won't work without embeddings in Redis
**Command:**
```bash
pnpm tsx scripts/generate-embeddings.ts
```

### **REQUIRED - After Redis Cache Clear** 🗑️  
**Scenario:** You cleared Redis cache (`redis-cli FLUSHDB`) or lost data
**Why:** All embeddings are gone and need to be regenerated
**Command:**
```bash
pnpm tsx scripts/generate-embeddings.ts
```

### **OPTIONAL - Content Updates** 🔄
**Scenario:** InfinitePay updated their help articles
**Why:** Old embeddings may not match new content
**Command:**
```bash
# Clear old embeddings first
redis-cli DEL "cache:processed_articles:quick"
pnpm tsx scripts/generate-embeddings.ts
```

### **OPTIONAL - Debugging Issues** 🐛
**Scenario:** Semantic search returning poor results
**Why:** Test embedding generation independently
**Command:**
```bash
pnpm tsx scripts/generate-embeddings.ts
```

## ⚠️ When NOT to Run This Script

- ✅ **Backend is already working** - embeddings exist in Redis
- ✅ **Semantic search is returning good results** - no issues detected
- ✅ **Just restarted the backend** - embeddings persist in Redis
- ✅ **Making code changes** - embeddings don't need regeneration

## 🔍 How to Check if You Need to Run It

**Option 1: Check Redis**
```bash
redis-cli KEYS "cache:embedding:*" | wc -l
# If returns 0 or very low number, run the script
```

**Option 2: Test the chatbot**
```bash
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Como acompanhar pedido da maquininha?"}'
# If returns generic answers, you need embeddings
```

**Option 3: Check backend logs**
```
# Look for this message when starting backend:
📚 Using quick cache with X articles
# If you see this, embeddings exist
```

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
