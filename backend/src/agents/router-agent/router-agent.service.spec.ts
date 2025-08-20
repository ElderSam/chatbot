import { Test, TestingModule } from '@nestjs/testing';
import { RouterAgentService } from './router-agent.service';

describe('RouterAgentService', () => {
  let service: RouterAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RouterAgentService],
    }).compile();

    service = module.get<RouterAgentService>(RouterAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
