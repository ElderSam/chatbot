import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeAgentService } from './knowledge-agent.service';
import { EmbeddingService } from './embedding.service';
import { GroqService } from '../groq/groq.service';
import { RedisLoggerService } from '../../redis/redis-logger/redis-logger.service';
import { RedisCacheService } from '../../redis/redis-cache/redis-cache.service';

describe('KnowledgeAgentService', () => {
  let service: KnowledgeAgentService;
  let embeddingService: jest.Mocked<EmbeddingService>;
  let groqService: jest.Mocked<GroqService>;
  let redisCache: jest.Mocked<RedisCacheService>;
  let logger: jest.Mocked<RedisLoggerService>;

  beforeEach(async () => {
    // Mock loadDynamicContext to return test articles
    jest.spyOn(require('./context-loader'), 'loadDynamicContext').mockResolvedValue([
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
    ]);

    // Create mocks
    embeddingService = {
      findMostRelevantArticles: jest.fn().mockResolvedValue([
        { 
          title: 'Como acompanhar pedido da maquininha', 
          url: 'https://ajuda.infinitepay.io/test', 
          text: 'Para acompanhar seu pedido da maquininha, acesse o painel...' 
        }
      ]),
      generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
      storeArticleEmbeddings: jest.fn().mockResolvedValue(undefined)
    } as any;

    groqService = {
      chatCompletion: jest.fn().mockResolvedValue({
        responseMsg: 'Baseado nas informações disponíveis, você pode acompanhar o pedido da sua maquininha acessando o painel de controle...',
        data: {}
      })
    } as any;

    redisCache = {
      getCache: jest.fn().mockResolvedValue(null),
      setCache: jest.fn().mockResolvedValue(undefined),
      getKeysPattern: jest.fn().mockResolvedValue([])
    } as any;

    logger = {
      log: jest.fn()
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeAgentService,
        { provide: EmbeddingService, useValue: embeddingService },
        { provide: GroqService, useValue: groqService },
        { provide: RedisCacheService, useValue: redisCache },
        { provide: RedisLoggerService, useValue: logger },
      ],
    }).compile();

    service = module.get<KnowledgeAgentService>(KnowledgeAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should use semantic search to answer questions', async () => {
    const question = 'Como faço para acompanhar minha maquininha?';
    
    const result = await service.answer(question);
    
    expect(embeddingService.findMostRelevantArticles).toHaveBeenCalledWith(question, 3);
    expect(groqService.chatCompletion).toHaveBeenCalled();
    expect(result.responseMsg).toContain('acompanhar');
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
    
    const result = await service.answer(question);
    
    expect(result.responseMsg).toContain('Desculpe');
    expect(logger.log).toHaveBeenCalledWith(
      'knowledge-agent',
      expect.objectContaining({
        question: question,
        error: expect.stringContaining('Embedding error')
      })
    );
  });
});
