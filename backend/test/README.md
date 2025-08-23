# 📋 Guia de Padrões de Teste

Este documento descreve os padrões e melhores práticas para escrever testes no projeto chatbot.

## 🏗️ Estrutura de Testes

```
backend/
├── src/
│   └── **/*.spec.ts          # Testes unitários
└── test/
    ├── **/*.e2e-spec.ts       # Testes E2E
    └── utils/
        ├── test-app.factory.ts     # Factory para E2E tests
        ├── unit-test.factory.ts    # Factory para testes unitários
        └── agent-test.helpers.ts   # Helpers específicos
```

## 🏭 Factories de Teste

### TestAppFactory (E2E Tests)

Use para criar aplicações de teste para E2E:

```typescript
import { TestAppFactory, CommonTestPayloads } from './utils/test-app.factory';

describe('My E2E Test', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Setup básico
    app = await TestAppFactory.createApp();

    // Setup com configuração específica
    app = await TestAppFactory.createApp({ 
      groqServiceOptions: { type: 'workflow' }
    });

    // Setup com mocks customizados
    app = await TestAppFactory.createApp({
      customMocks: {
        groqService: { /* mock customizado */ }
      }
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
```

### UnitTestFactory (Testes Unitários)

Use para criar módulos de teste para testes unitários:

```typescript
import { UnitTestFactory, CommonMockData } from '../../../test/utils/unit-test.factory';

describe('MyService', () => {
  let service: MyService;

  beforeEach(async () => {
    const module = await UnitTestFactory.createTestingModule({
      providers: [
        MyService,
        GroqService,
        EmbeddingService,
      ],
      customMocks: {
        groqService: { /* mock específico */ }
      }
    });

    service = module.get<MyService>(MyService);
  });
});
```

## 📦 Payloads Comuns

### Uso dos CommonTestPayloads

```typescript
import { CommonTestPayloads } from './utils/test-app.factory';

// Payloads pré-definidos
.send(CommonTestPayloads.validChat)
.send(CommonTestPayloads.mathQuestion)
.send(CommonTestPayloads.suspiciousChat)

// Payload customizado
.send(CommonTestPayloads.createCustom({
  message: 'Custom message',
  user_id: 'client999'
}))

// Payload para teste específico
.send({
  ...CommonTestPayloads.validChat,
  message: 'Specific test message'
})
```

### Payloads Disponíveis

- `validChat` - Chat válido básico
- `mathChat` - Pergunta matemática
- `suspiciousChat` - Conteúdo suspeito
- `invalidMessage` - Mensagem inválida
- `htmlInjection` - Teste de sanitização
- `portugueseChars` - Caracteres portugueses
- `knowledgeQuestion` - Pergunta de conhecimento
- `mathQuestion` - Pergunta matemática específica
- `longMessage` - Mensagem longa
- `numbersOnly` - Apenas números

## 🛠️ Helpers Específicos

### AgentTestHelper

Para testes de agentes:

```typescript
import { AgentTestHelper } from '../../../test/utils/agent-test.helpers';

// Mocks específicos para KnowledgeAgent
const mocks = AgentTestHelper.createKnowledgeAgentMocks({
  embeddingService: { /* override específico */ }
});

// Mocks específicos para RouterAgent
const mocks = AgentTestHelper.createRouterAgentMocks();
```

### TestAssertions

Para verificações comuns:

```typescript
import { TestAssertions } from '../../../test/utils/agent-test.helpers';

// Verificar estrutura de resposta de agente
TestAssertions.expectAgentResponse(response);

// Verificar workflow de agente
TestAssertions.expectAgentWorkflow(workflow);

// Verificar chamadas de mock
TestAssertions.expectMockCalls(mockFunction, 2);
```

## 📝 Padrões de Nomenclatura

### Arquivos de Teste

- **Testes Unitários**: `*.spec.ts`
- **Testes E2E**: `*.e2e-spec.ts`
- **Helpers/Factories**: `*.factory.ts`, `*.helpers.ts`

### Estrutura de describe/it

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Arrange
      // Act  
      // Assert
    });

    it('should handle error when invalid input', () => {
      // Test error cases
    });
  });
});
```

### E2E Tests

```typescript
describe('Feature Name (e2e)', () => {
  describe('Scenario group', () => {
    it('should succeed when valid input', () => {
      return request(app.getHttpServer())
        .post('/endpoint')
        .send(CommonTestPayloads.validChat)
        .expect(200)
        .expect(res => {
          expect(res.body.response).toBeDefined();
        });
    });
  });
});
```

## 🎯 Melhores Práticas

### 1. Setup e Cleanup

```typescript
beforeEach(async () => {
  // Setup para cada teste
});

afterEach(async () => {
  // Cleanup necessário (ex: fechar app)
  await app?.close();
});
```

### 2. Mocks Específicos

```typescript
// ✅ Bom - Mock específico para o teste
const mockService = {
  method: jest.fn().mockResolvedValue(expectedResult)
};

// ❌ Evite - Mock genérico demais
const mockService = {} as any;
```

### 3. Assertions Claras

```typescript
// ✅ Bom - Assertion específica
expect(result.responseMsg).toContain('expected text');
expect(result.data.calculation).toBe('2 + 2 = 4');

// ❌ Evite - Assertion genérica demais
expect(result).toBeTruthy();
```

### 4. Testes Isolados

```typescript
// ✅ Bom - Teste isolado
it('should calculate correctly', () => {
  const input = { a: 2, b: 2 };
  const result = service.calculate(input);
  expect(result).toBe(4);
});

// ❌ Evite - Dependência entre testes
let sharedState;
```

## 🔧 Comandos Úteis

```bash
# Executar todos os testes
npm test

# Executar testes unitários específicos
npm test -- knowledge-agent.service.spec.ts

# Executar testes E2E específicos
npm run test:e2e -- chat.prompt-injection.e2e-spec.ts

# Executar testes com coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📊 Cobertura de Teste

Mantenha cobertura alta focando em:

1. **Casos felizes** - Fluxos principais funcionando
2. **Casos de erro** - Como o sistema lida com erros
3. **Edge cases** - Cenários extremos
4. **Validações** - Entrada inválida
5. **Integrações** - Comunicação entre componentes

## 🚀 Checklist para Novos Testes

- [ ] Usa factories apropriados (`TestAppFactory` ou `UnitTestFactory`)
- [ ] Utiliza `CommonTestPayloads` quando possível
- [ ] Mocks são específicos e realistas
- [ ] Assertions são claras e específicas
- [ ] Testes são isolados e independentes
- [ ] Cleanup adequado (`afterEach`)
- [ ] Nomenclatura descritiva
- [ ] Cobertura de casos de erro
- [ ] Documentação se necessário
