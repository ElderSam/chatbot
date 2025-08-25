# 🔧 Scripts

## ⚠️ **IMPORTANT: Run BEFORE starting the backend**

The KnowledgeAgent requires embeddings data to answer questions about InfinitePay. **Without this, the backend will start but fail silently on knowledge questions.**

---

## `generate-embeddings.ts`

**Purpose:** Creates semantic search data for InfinitePay articles.

```bash
# Run from backend/ directory
pnpm run embeddings
```

**What it does:**
- Scrapes articles from https://ajuda.infinitepay.io/pt-BR/
- Generates AI embeddings using HuggingFace API
- Stores embeddings in Redis for fast semantic search
- Takes ~2 minutes on first run

**When to run:**
- ✅ **First setup** (required before starting backend)
- 🔄 After clearing Redis cache (`docker-compose down -v`)
- 📝 When InfinitePay updates their help articles

**Without this script:**
- ❌ Questions like "taxa da maquininha" will fail
- ❌ KnowledgeAgent returns generic fallback responses
- ❌ No semantic search functionality

---

## `test-observability.ts`

Tests the logging system.

```bash
pnpm tsx scripts/test-observability.ts
```

---

## Redis Backup

Veja o guia de backup do Redis em [`REDIS_BACKUP.md`](./REDIS_BACKUP.md)
