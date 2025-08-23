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
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<RedisLoggerService>(RedisLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log data to Redis', async () => {
    const logData = { message: 'test', timestamp: new Date() };

    // Mock the set method
    const setSpy = jest.spyOn(service as any, 'set').mockResolvedValue(undefined);

    await service.log('test-component', logData);

    expect(setSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^logs:test-component:\d+$/),
      { ...logData, agent: 'test-component' },
      900 // 15 minutes
    );
  });
});
