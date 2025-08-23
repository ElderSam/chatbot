import { Test, TestingModule } from '@nestjs/testing';
import { RedisCacheService } from './redis-cache.service';
import { ConfigService } from '@nestjs/config';

describe('RedisCacheService', () => {
  let service: RedisCacheService;
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
        RedisCacheService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get cached data', async () => {
    const testData = { key: 'value' };
    // Mock the get method to return stringified data
    jest.spyOn(service as any, 'get').mockResolvedValue(testData);

    const result = await service.getCache('test-key');

    expect(result).toEqual(testData);
  });

  it('should set cached data', async () => {
    // Mock the set method
    const setSpy = jest.spyOn(service as any, 'set').mockResolvedValue(undefined);

    const testData = { key: 'value' };
    await service.setCache('test-key', testData, 3600);

    expect(setSpy).toHaveBeenCalledWith(
      'cache:test-key',
      testData,
      3600
    );
  });

  it('should return null for non-existent cache', async () => {
    jest.spyOn(service as any, 'get').mockResolvedValue(null);

    const result = await service.getCache('non-existent');

    expect(result).toBeNull();
  });
});
