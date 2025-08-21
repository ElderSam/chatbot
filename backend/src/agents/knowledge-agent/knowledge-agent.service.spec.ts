import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeAgentService } from './knowledge-agent.service';

describe('KnowledgeAgentService', () => {
  let service: KnowledgeAgentService;
  let redisCache: any;

  beforeEach(async () => {
    jest.spyOn(require('./context-loader'), 'loadDynamicContext').mockResolvedValue([
      { title: 'Mock', url: 'https://mock', text: 'Conteúdo mock' }
    ]);
    redisCache = {
      getCache: jest.fn().mockResolvedValue(null),
      setCache: jest.fn().mockResolvedValue(undefined),
    };
    const groq = { chatCompletion: jest.fn().mockResolvedValue('Resposta mockada') };
    const logger = { log: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeAgentService,
        { provide: require('../../redis/redis-logger/redis-logger.service').RedisLoggerService, useValue: logger },
        { provide: require('../groq/groq.service').GroqService, useValue: groq },
        { provide: require('../../redis/redis-cache/redis-cache.service').RedisCacheService, useValue: redisCache },
      ],
    }).compile();

    service = module.get<KnowledgeAgentService>(KnowledgeAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});
