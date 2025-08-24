import { Test, TestingModule } from '@nestjs/testing';
import { createMockConfigService, createMockEmbeddingService } from './common-mocks';

export interface MockServices {
  embeddingService?: any;
  groqService?: any;
  redisCache?: any;
  redisLogger?: any;
  mathService?: any;
  knowledgeService?: any;
  configService?: any;
}

export interface UnitTestModuleOptions {
  providers: any[];
  customMocks?: MockServices;
}

export class UnitTestFactory {
  static async createTestingModule(options: UnitTestModuleOptions): Promise<TestingModule> {
    const { providers, customMocks = {} } = options;

    // Default mocks que são comumente usados
    const defaultMocks = this.createDefaultMocks();
    const finalMocks = { ...defaultMocks, ...customMocks };

    // Mapear providers com seus mocks correspondentes
    const mockProviders = providers.map(provider => {
      if (typeof provider === 'function') {
        // Se o provider for uma classe, tentamos encontrar um mock correspondente
        const mockKey = this.getMockKeyForProvider(provider);
        if (mockKey && finalMocks[mockKey]) {
          return { provide: provider, useValue: finalMocks[mockKey] };
        }
        return provider; // Retorna o provider original se não houver mock
      }
      return provider; // Retorna providers que já são objetos de configuração
    });

    return Test.createTestingModule({
      providers: mockProviders,
    }).compile();
  }

  private static createDefaultMocks(): MockServices {
    return {
      embeddingService: createMockEmbeddingService(),

      groqService: {
        chatCompletion: jest.fn().mockResolvedValue({
          responseMsg: 'Test response from Groq',
          data: {}
        })
      },

      redisCache: {
        getCache: jest.fn().mockResolvedValue(null),
        setCache: jest.fn().mockResolvedValue(undefined),
        getKeysPattern: jest.fn().mockResolvedValue([])
      },

      redisLogger: {
        log: jest.fn().mockResolvedValue(undefined),
        info: jest.fn().mockResolvedValue(undefined),
        debug: jest.fn().mockResolvedValue(undefined),
        error: jest.fn().mockResolvedValue(undefined)
      },

      mathService: {
        solve: jest.fn().mockResolvedValue({
          responseMsg: 'The result is 42',
          data: { calculation: '40 + 2 = 42' }
        })
      },

      knowledgeService: {
        answer: jest.fn().mockResolvedValue({
          responseMsg: 'Based on the knowledge base, here is the answer...',
          data: { articles: [] }
        })
      },

      configService: createMockConfigService()
    };
  }

  private static getMockKeyForProvider(provider: any): keyof MockServices | null {
    const name = provider.name;
    const mockKeyMap: Record<string, keyof MockServices> = {
      'EmbeddingService': 'embeddingService',
      'GroqService': 'groqService',
      'RedisCacheService': 'redisCache',
      'RedisLoggerService': 'redisLogger',
      'MathAgentService': 'mathService',
      'KnowledgeAgentService': 'knowledgeService',
      'ConfigService': 'configService'
    };
    
    return mockKeyMap[name] || null;
  }
}

// Mock data patterns comuns para testes
export const CommonMockData = {
  articles: [
    { 
      title: 'Como acompanhar pedido da maquininha', 
      url: 'https://ajuda.infinitepay.io/test', 
      text: 'Para acompanhar seu pedido da maquininha, acesse o painel...' 
    },
    { 
      title: 'Rastreamento da entrega', 
      url: 'https://ajuda.infinitepay.io/test2', 
      text: 'Você pode rastrear sua entrega usando o código fornecido...' 
    }
  ],

  embeddings: [0.1, 0.2, 0.3, 0.4, 0.5],

  groqResponses: {
    knowledgeAgent: {
      responseMsg: 'Baseado nas informações disponíveis, você pode acompanhar o pedido...',
      data: {}
    },
    mathAgent: {
      responseMsg: '42',
      data: { calculation: '40 + 2 = 42' }
    },
    routerDecision: {
      responseMsg: 'KnowledgeAgent',
      data: {}
    }
  },

  testQuestions: {
    knowledge: 'Como faço para acompanhar minha maquininha?',
    math: 'Quanto é 2 + 2?',
    general: 'Qual a taxa da maquininha?'
  }
};

// Helper para mockar contexto dinâmico
export const mockDynamicContext = () => {
  jest.spyOn(require('../../../src/agents/knowledge-agent/context-loader'), 'loadDynamicContext')
    .mockResolvedValue(CommonMockData.articles);
};
