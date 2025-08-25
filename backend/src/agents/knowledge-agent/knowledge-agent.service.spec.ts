import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeAgentService } from './knowledge-agent.service';
import { EmbeddingService } from './embedding.service';
import { GroqService } from '../groq/groq.service';
import { RedisLoggerService } from '../../redis/redis-logger/redis-logger.service';
import { RedisCacheService } from '../../redis/redis-cache/redis-cache.service';
import { MAX_ARTICLES_FOR_CONTEXT, SAFETY_MODE, MAX_ARTICLES_SAFETY_MODE } from './constants';
import { CommonMockData } from '../../../test/utils/unit-test.factory';
import { AgentTestHelper, TestAssertions } from '../../../test/utils/agent-test.helpers';

describe('KnowledgeAgentService', () => {
  let service: KnowledgeAgentService;
  let embeddingService: jest.Mocked<EmbeddingService>;
  let groqService: jest.Mocked<GroqService>;
  let redisCache: jest.Mocked<RedisCacheService>;
  let logger: jest.Mocked<RedisLoggerService>;

  beforeEach(async () => {
    // Mock contexto dinâmico
    jest.spyOn(require('./context-loader'), 'loadDynamicContext')
      .mockResolvedValue(CommonMockData.articles);

    // Usar helper para criar mocks
    const mocks = AgentTestHelper.createKnowledgeAgentMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeAgentService,
        { provide: EmbeddingService, useValue: mocks.embeddingService },
        { provide: GroqService, useValue: mocks.groqService },
        { provide: RedisCacheService, useValue: {
          getCache: jest.fn().mockResolvedValue(null),
          setCache: jest.fn().mockResolvedValue(undefined),
          getKeysPattern: jest.fn().mockResolvedValue([])
        }},
        { provide: RedisLoggerService, useValue: {
          log: jest.fn(),
          info: jest.fn(),
          debug: jest.fn(),
          error: jest.fn()
        }},
      ],
    }).compile();

    service = module.get<KnowledgeAgentService>(KnowledgeAgentService);
    embeddingService = module.get(EmbeddingService);
    groqService = module.get(GroqService);
    redisCache = module.get(RedisCacheService);
    logger = module.get(RedisLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should use semantic search to answer questions', async () => {
    const question = CommonMockData.testQuestions.knowledge;
    
    const result = await service.answer(question);
    
    TestAssertions.expectAgentResponse(result);
    const maxArticles = SAFETY_MODE ? MAX_ARTICLES_SAFETY_MODE : MAX_ARTICLES_FOR_CONTEXT;
    expect(embeddingService.findMostRelevantArticles).toHaveBeenCalledWith(question, maxArticles);
    expect(groqService.chatCompletion).toHaveBeenCalled();
  });

  it('should fallback to dynamic loading when no semantic results', async () => {
    embeddingService.findMostRelevantArticles = jest.fn().mockResolvedValue([]);
    
    const question = 'Pergunta sobre maquininha';
    
    const result = await service.answer(question);
    
    expect(embeddingService.findMostRelevantArticles).toHaveBeenCalled();
    expect(groqService.chatCompletion).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    embeddingService.findMostRelevantArticles = jest.fn().mockRejectedValue(new Error('Embedding error'));

    const question = 'Teste de erro';

    try {
      const result = await service.answer(question);
      expect(result.responseMsg).toMatch(/Desculpe|Sorry/);
      expect(logger.error).toHaveBeenCalledWith(
        'KnowledgeAgent',
        expect.objectContaining({
          question: question,
          error: 'Embedding error'
        })
      );
    } catch (error) {
      expect(error.message).toMatch(/Desculpe|Sorry/);
    }
  });
});
