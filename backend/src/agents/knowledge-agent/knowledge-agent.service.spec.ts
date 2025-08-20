import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeAgentService } from './knowledge-agent.service';

describe('KnowledgeAgentService', () => {
  let service: KnowledgeAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgeAgentService],
    }).compile();

    service = module.get<KnowledgeAgentService>(KnowledgeAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
