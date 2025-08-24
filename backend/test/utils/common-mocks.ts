import { ConfigService } from '@nestjs/config';

/**
 * Mock centralizado do ConfigService para uso em todos os testes
 */
export const createMockConfigService = (): Partial<ConfigService> => ({
  get: jest.fn().mockImplementation((key: string) => {
    const configMap: Record<string, string> = {
      'REDIS_HOST': 'localhost',
      'REDIS_PORT': '6379', 
      'GROQ_API_KEY': 'mock-groq-key',
      'HUGGINGFACE_API_KEY': 'mock-hf-key',
      'NODE_ENV': 'test',
      'PORT': '3000',
      'REDIS_TTL': '900',
      'LOG_LEVEL': 'debug'
    };
    
    return configMap[key] || null;
  })
});

/**
 * Mock centralizado do EmbeddingService
 */
export const createMockEmbeddingService = () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3, 0.4]),
  findMostRelevantArticles: jest.fn().mockResolvedValue([
    {
      title: 'Test Article',
      url: 'https://test.com/article',
      text: 'This is a test article content',
    }
  ]),
  storeArticleEmbeddings: jest.fn().mockResolvedValue(undefined)
});

/**
 * Configuração comum do TestingModule para evitar duplicação
 */
export const createTestModuleConfig = (overrides: {
  groqService?: any;
  embeddingService?: any;
  configService?: any;
} = {}) => {
  const defaultMocks = {
    groqService: {
      chatCompletion: jest.fn().mockResolvedValue({
        responseMsg: 'KnowledgeAgent',
        data: {}
      })
    },
    embeddingService: createMockEmbeddingService(),
    configService: createMockConfigService()
  };

  return {
    groqService: overrides.groqService || defaultMocks.groqService,
    embeddingService: overrides.embeddingService || defaultMocks.embeddingService,
    configService: overrides.configService || defaultMocks.configService
  };
};
