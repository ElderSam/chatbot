import { UnitTestFactory, CommonMockData } from './unit-test.factory';
import { TestingModule } from '@nestjs/testing';

/**
 * Helper específico para testes de agentes (Knowledge, Math, Router)
 */
export class AgentTestHelper {
  
  /**
   * Cria mocks específicos para KnowledgeAgent
   */
  static createKnowledgeAgentMocks(customMocks?: any) {
    // Mock contexto dinâmico
    jest.spyOn(require('../../src/agents/knowledge-agent/context-loader'), 'loadDynamicContext')
      .mockResolvedValue(CommonMockData.articles);

    const defaultMocks = {
      embeddingService: {
        findMostRelevantArticles: jest.fn().mockResolvedValue(CommonMockData.articles.slice(0, 1)),
        generateEmbedding: jest.fn().mockResolvedValue(CommonMockData.embeddings),
        storeArticleEmbeddings: jest.fn().mockResolvedValue(undefined)
      },
      groqService: {
        chatCompletion: jest.fn().mockResolvedValue(CommonMockData.groqResponses.knowledgeAgent)
      }
    };

    return { ...defaultMocks, ...customMocks };
  }

  /**
   * Cria mocks específicos para RouterAgent
   */
  static createRouterAgentMocks(customMocks?: any) {
    const defaultMocks = {
      groqService: {
        chatCompletion: jest.fn().mockResolvedValue(CommonMockData.groqResponses.routerDecision)
      },
      mathService: {
        solve: jest.fn().mockResolvedValue(CommonMockData.groqResponses.mathAgent)
      },
      knowledgeService: {
        answer: jest.fn().mockResolvedValue(CommonMockData.groqResponses.knowledgeAgent)
      }
    };

    return { ...defaultMocks, ...customMocks };
  }

  /**
   * Cria mocks específicos para MathAgent
   */
  static createMathAgentMocks(customMocks?: any) {
    const defaultMocks = {
      groqService: {
        chatCompletion: jest.fn().mockResolvedValue(CommonMockData.groqResponses.mathAgent)
      }
    };

    return { ...defaultMocks, ...customMocks };
  }
}

/**
 * Helper específico para testes de Redis services
 */
export class RedisTestHelper {
  
  /**
   * Configura mocks padrões para Redis services
   */
  static createRedisMocks() {
    return {
      redisCache: {
        getCache: jest.fn().mockResolvedValue(null),
        setCache: jest.fn().mockResolvedValue(undefined),
        getKeysPattern: jest.fn().mockResolvedValue([]),
        deleteCache: jest.fn().mockResolvedValue(undefined),
        deleteKeysPattern: jest.fn().mockResolvedValue(undefined)
      },
      redisLogger: {
        log: jest.fn().mockResolvedValue(undefined),
        getRecentLogs: jest.fn().mockResolvedValue([]),
        clearLogs: jest.fn().mockResolvedValue(undefined)
      }
    };
  }
}

/**
 * Helper específico para testes de controladores
 */
export class ControllerTestHelper {
  
  /**
   * Cria mocks padrões para controladores de chat
   */
  static createChatControllerMocks() {
    return {
      routerAgent: {
        routeAndHandle: jest.fn().mockResolvedValue({
          chosenAgent: 'KnowledgeAgent',
          agentResult: CommonMockData.groqResponses.knowledgeAgent,
          agentWorkflow: [
            { agent: 'RouterAgent', decision: 'KnowledgeAgent' },
            { agent: 'KnowledgeAgent', response: 'Test response' }
          ]
        })
      },
      promptGuard: {
        isBlocked: jest.fn().mockReturnValue(false),
        getBlockReason: jest.fn().mockReturnValue('')
      }
    };
  }
}

/**
 * Assertions helpers para testes comuns
 */
export class TestAssertions {
  
  /**
   * Verifica se uma resposta de agente tem a estrutura esperada
   */
  static expectAgentResponse(response: any) {
    expect(response).toBeDefined();
    expect(response.responseMsg).toBeDefined();
    expect(typeof response.responseMsg).toBe('string');
    expect(response.data).toBeDefined();
  }

  /**
   * Verifica se um workflow de agente tem a estrutura esperada
   */
  static expectAgentWorkflow(workflow: any[]) {
    expect(Array.isArray(workflow)).toBe(true);
    expect(workflow.length).toBeGreaterThan(0);
    workflow.forEach(step => {
      expect(step.agent).toBeDefined();
      expect(typeof step.agent).toBe('string');
    });
  }

  /**
   * Verifica se mocks foram chamados corretamente
   */
  static expectMockCalls(mock: jest.Mock, expectedCalls: number = 1) {
    expect(mock).toHaveBeenCalledTimes(expectedCalls);
  }
}
