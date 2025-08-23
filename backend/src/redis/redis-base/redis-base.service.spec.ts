import { Test, TestingModule } from '@nestjs/testing';
import { RedisBaseService } from './redis-base.service';
import { ConfigService } from '@nestjs/config';

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    keys: jest.fn().mockResolvedValue([]),
    del: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
  }));
});

// Create a concrete implementation for testing
class TestRedisService extends RedisBaseService {
  constructor(cfg: ConfigService) {
    super(cfg);
  }
}

describe('RedisBaseService', () => {
  let service: TestRedisService;
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
        { provide: TestRedisService, useFactory: (cfg: ConfigService) => new TestRedisService(cfg), inject: [ConfigService] },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<TestRedisService>(TestRedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to Redis with config', async () => {
    expect(configService.get).toHaveBeenCalledWith('REDIS_HOST', 'localhost');
    expect(configService.get).toHaveBeenCalledWith('REDIS_PORT', 6379);
  });
});
