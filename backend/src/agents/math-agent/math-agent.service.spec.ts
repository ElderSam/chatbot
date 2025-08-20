import { Test, TestingModule } from '@nestjs/testing';
import { MathAgentService } from './math-agent.service';

describe('MathAgentService', () => {
  let service: MathAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MathAgentService],
    }).compile();

    service = module.get<MathAgentService>(MathAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
