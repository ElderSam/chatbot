import { Test, TestingModule } from '@nestjs/testing';
import { RedisLoggerService } from './redis-logger.service';

describe('RedisLoggerService', () => {
  let service: RedisLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisLoggerService],
    }).compile();

    service = module.get<RedisLoggerService>(RedisLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
