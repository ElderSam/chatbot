# 🧪 Testing Guide

## Running Tests

```bash
# Unit tests
pnpm test

# E2E tests  
pnpm test:e2e

# With coverage
pnpm test:cov
```

## Test Structure

```
src/**/*.spec.ts     # Unit tests
test/**/*.e2e-spec.ts # E2E tests
test/utils/          # Test utilities
```

## Test Utilities

- **`TestAppFactory`**: E2E app setup
- **`UnitTestFactory`**: Unit test mocks
- **`agent-test.helpers.ts`**: Agent-specific helpers

## E2E Test Categories

- **`chat.workflow.e2e-spec.ts`**: End-to-end chat flow
- **`chat.validation.e2e-spec.ts`**: Input validation  
- **`chat.sanitization.e2e-spec.ts`**: Security testing
- **`chat.prompt-injection.e2e-spec.ts`**: Prompt injection prevention

---
*Tests use in-memory Redis for isolation*
