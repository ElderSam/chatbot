# 🔧 Scripts

Utility scripts for embeddings and testing.

## `generate-embeddings.ts`

Generates semantic embeddings for the Knowledge Agent.

```bash
# Recommended: Simple npm script
pnpm run embeddings

# Alternative ways:
pnpm tsx scripts/generate-embeddings.ts
node --env-file=.env --loader=ts-node/esm scripts/generate-embeddings.ts
```

**When to run:**
- ✅ **First setup** (required)
- ✅ **After Redis clear** (required)  
- 🔄 **Content updates** (optional)

## `test-observability.ts` 

Tests the observability system.

```bash
pnpm tsx scripts/test-observability.ts
```

---
*Run from project root: `cd backend && pnpm tsx scripts/<script-name>`*
