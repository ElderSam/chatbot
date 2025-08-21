import { loadDynamicContext, setRedisCacheService } from './context-loader';
import { RedisCacheService } from '../../redis/redis-cache/redis-cache.service';

describe('context-loader cache integration', () => {
  let redisCache: any;

  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(async (url) => {
      return {
        text: async () => '<main><div><section><a href="/pt-BR/collections/mock">Coleção Mock</a></section></div></main>',
        status: 200,
      };
    });
    redisCache = {
      getCache: jest.fn().mockResolvedValue(null),
      setCache: jest.fn().mockResolvedValue(undefined),
    };
    setRedisCacheService(redisCache);
  });

  it('should call RedisCacheService when loading context', async () => {
    // Força o loader a buscar uma página real, mas intercepta o cache
    await loadDynamicContext('taxa da maquininha');
    expect(redisCache.getCache).toHaveBeenCalled();
    expect(redisCache.setCache).toHaveBeenCalled();
  });
});
