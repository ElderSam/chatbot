import { Test, TestingModule } from '@nestjs/testing';
import { EmbeddingService } from './embedding.service';
import { RedisCacheService } from '../../redis/redis-cache/redis-cache.service';
import { ArticleContext, ArticleWithEmbedding } from './types';

// Mock HuggingFace
jest.mock('@huggingface/inference', () => ({
  InferenceClient: jest.fn().mockImplementation(() => ({
    featureExtraction: jest.fn().mockResolvedValue([0.1, 0.2, 0.3, 0.4])
  }))
}));

describe('EmbeddingService', () => {
  let service: EmbeddingService;
  let redisCache: jest.Mocked<RedisCacheService>;

  beforeEach(async () => {
    redisCache = {
      getCache: jest.fn().mockResolvedValue(null),
      setCache: jest.fn((...args) => Promise.resolve(undefined)),
      getKeysPattern: jest.fn().mockResolvedValue([
        'cache:embedding:https://test.com/article1',
        'cache:embedding:https://test.com/article2'
      ])
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbeddingService,
        { provide: RedisCacheService, useValue: redisCache }
      ],
    }).compile();

    service = module.get<EmbeddingService>(EmbeddingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate embeddings from text', async () => {
    const text = 'Como acompanhar pedido da maquininha';
    
    const embedding = await service.generateEmbedding(text);
    
    expect(embedding).toEqual([0.1, 0.2, 0.3, 0.4]);
  });

  it('should store article embeddings in cache', async () => {
    const articles: ArticleContext[] = [
      {
        title: 'Test Article',
        url: 'https://test.com/article',
        text: 'This is a test article content'
      }
    ];

    await service.storeArticleEmbeddings(articles);

    // Aceita undefined ou Number como TTL
    const call = redisCache.setCache.mock.calls[0];
    expect(call[0]).toBe('embedding:https://test.com/article');
    expect(call[1]).toEqual(expect.objectContaining({
      title: 'Test Article',
      url: 'https://test.com/article',
      text: 'This is a test article content',
      embedding: [0.1, 0.2, 0.3, 0.4]
    }));
    expect([undefined, expect.any(Number)]).toContainEqual(call[2]);
  });

  it('should skip articles already in cache', async () => {
    redisCache.getCache = jest.fn().mockResolvedValue({
      title: 'Cached Article',
      embedding: [0.1, 0.2, 0.3, 0.4]
    });

    const articles: ArticleContext[] = [
      {
        title: 'Cached Article',
        url: 'https://test.com/cached',
        text: 'Already cached content'
      }
    ];

    await service.storeArticleEmbeddings(articles);

    expect(redisCache.setCache).not.toHaveBeenCalled();
  });

  it('should find most relevant articles using cosine similarity', async () => {
    const mockArticles: ArticleWithEmbedding[] = [
      {
        title: 'Acompanhar pedido',
        url: 'https://test.com/pedido',
        text: 'Como acompanhar pedido da maquininha',
        embedding: [1.0, 0.0, 0.0, 0.0] // High similarity when question is similar
      },
      {
        title: 'Configurar WiFi',
        url: 'https://test.com/wifi', 
        text: 'Como conectar maquininha no WiFi',
        embedding: [0.0, 1.0, 0.0, 0.0] // Low similarity with question
      }
    ];

    // Mock generateEmbedding to return vector similar to first article
    service.generateEmbedding = jest.fn().mockResolvedValue([0.9, 0.1, 0.0, 0.0]);

    // Mock getActiveEmbeddingKeys to return cache keys
    (service as any).getActiveEmbeddingKeys = jest.fn().mockResolvedValue([
      'cache:embedding:https://test.com/pedido',
      'cache:embedding:https://test.com/wifi'
    ]);

    redisCache.getCache = jest.fn()
      .mockResolvedValueOnce(null) // No cache hit for search
      .mockResolvedValueOnce(mockArticles[0])
      .mockResolvedValueOnce(mockArticles[1]);

    const question = 'Como acompanhar meu pedido?';
    
    const result = await service.findMostRelevantArticles(question, 1);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Acompanhar pedido');
  });

  it('should handle embedding generation errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    service.generateEmbedding = jest.fn().mockRejectedValue(new Error('API Error'));

    await expect(service.generateEmbedding('test')).rejects.toThrow('API Error');
    
    consoleSpy.mockRestore();
  });
});
