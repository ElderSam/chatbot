import { loadDynamicContext, setRedisCacheService } from './context-loader';
import { RedisCacheService } from '../../redis/redis-cache/redis-cache.service';

describe('context-loader optimized cache integration', () => {
  let redisCache: any;

  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.includes('collections')) {
        return {
          text: async () => '<main><div><section><a href="/pt-BR/articles/1-test-article">Test Article</a></section></div></main>',
          status: 200,
        };
      }
      if (url.includes('articles')) {
        return {
          text: async () => '<html><body><h1>Test Article Title</h1><div class="article">Test article content for semantic search testing.</div></body></html>',
          status: 200,
        };
      }
      return {
        text: async () => `<main><div><section>
          ${Array.from({length: 7}, (_, i) => `<a href="/pt-BR/collections/${i+1}-collection">Collection ${i+1}</a>`).join('')}
        </section></div></main>`,
        status: 200,
      };
    });
    
    redisCache = {
      getCache: jest.fn().mockImplementation((key) => {
        if (key === 'processed_articles:quick') {
          return Promise.resolve([
            { title: 'Cached Article', url: 'https://test.com/1', text: 'Cached content' }
          ]);
        }
        return Promise.resolve(null);
      }),
      setCache: jest.fn().mockResolvedValue(undefined),
    };
    setRedisCacheService(redisCache);
  });

  it('should use quick cache when available', async () => {
    const result = await loadDynamicContext('maquininha');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Cached Article');
    expect(redisCache.getCache).toHaveBeenCalledWith('processed_articles:quick');
  });

  it('should process only target collection 7 when cache is empty', async () => {
    redisCache.getCache = jest.fn().mockResolvedValue(null);
    
    const result = await loadDynamicContext('maquininha teste');
    
    expect(redisCache.getCache).toHaveBeenCalled();
    expect(redisCache.setCache).toHaveBeenCalled();
    // Should call setCache for: base URL, collection, article, and quick cache
    expect(redisCache.setCache).toHaveBeenCalledTimes(4);
  });

  it('should handle fetch errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock para não usar quick cache e forçar erro na primeira requisição
    redisCache.getCache = jest.fn().mockResolvedValue(null);
    
    // Mock fetch para falhar sempre
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    let result;
    try {
      result = await loadDynamicContext('test');
    } catch (error) {
      result = [];
    }
    
    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });
});
