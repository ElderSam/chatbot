import { Test, TestingModule } from '@nestjs/testing';
import { RedisBaseService } from './redis-base.service';

describe('RedisBaseService', () => {
  let service: RedisBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisBaseService],
    }).compile();

    service = module.get<RedisBaseService>(RedisBaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
