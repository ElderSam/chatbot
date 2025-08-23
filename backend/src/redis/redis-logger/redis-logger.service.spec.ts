import { Test, TestingModule } from '@nestjs/testing';
import { RedisLoggerService } from './redis-logger.service';
import { ConfigService } from '@nestjs/config';

describe('RedisLoggerService', () => {
  let service: RedisLoggerService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'REDIS_HOST':
            return 'localhost';
          case 'REDIS_PORT':
            return '6379';
          default:
            return null;
        }
      })
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisLoggerService,
        { provide: ConfigService, useValue: configService }
      ],
    }).compile();

    service = module.get<RedisLoggerService>(RedisLoggerService);

    // Mock the Redis connection methods
    jest.spyOn(service, 'set').mockResolvedValue(undefined);
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log with proper format according to challenge requirements', async () => {
    const testData = {
      user_id: 'client789',
      conversation_id: 'conv-1234',
      execution_time: 150,
      message: 'Test message',
      decision: 'KnowledgeAgent'
    };

    await service.info('RouterAgent', testData);

    expect(service.set).toHaveBeenCalledWith(
      expect.stringMatching(/^logs:RouterAgent:\d+$/),
      expect.objectContaining({
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        level: 'INFO',
        agent: 'RouterAgent',
        user_id: 'client789',
        conversation_id: 'conv-1234',
        execution_time: 150,
        message: 'Test message',
        decision: 'KnowledgeAgent'
      }),
      900
    );

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('"timestamp"')
    );
  });

  it('should support different log levels', async () => {
    await service.debug('TestAgent', { test: 'debug' });
    await service.error('TestAgent', { test: 'error' });

    expect(service.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ level: 'DEBUG' }),
      900
    );

    expect(service.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ level: 'ERROR' }),
      900
    );
  });
});
