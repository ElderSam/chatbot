import { Test, TestingModule } from '@nestjs/testing';
import { RouterAgentService } from './router-agent.service';
import { MathAgentService } from '../math-agent/math-agent.service';
import { KnowledgeAgentService } from '../knowledge-agent/knowledge-agent.service';
import { GroqService } from '../groq/groq.service';
import { RedisLoggerService } from '../../redis/redis-logger/redis-logger.service';

describe('RouterAgentService', () => {
  let service: RouterAgentService;
  let mathService: jest.Mocked<MathAgentService>;
  let knowledgeService: jest.Mocked<KnowledgeAgentService>;
  let groqService: jest.Mocked<GroqService>;
  let loggerService: jest.Mocked<RedisLoggerService>;

  beforeEach(async () => {
    // Create mocks
    mathService = {
      solve: jest.fn().mockResolvedValue({
        responseMsg: 'The result is 42',
        data: { calculation: '40 + 2 = 42' }
      })
    } as any;

    knowledgeService = {
      answer: jest.fn().mockResolvedValue({
        responseMsg: 'Based on the knowledge base, here is the answer...',
        data: { articles: [] }
      })
    } as any;

    groqService = {
      chatCompletion: jest.fn().mockResolvedValue({
        responseMsg: 'KnowledgeAgent',
        data: {}
      })
    } as any;

    loggerService = {
      log: jest.fn().mockResolvedValue(undefined)
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouterAgentService,
        { provide: MathAgentService, useValue: mathService },
        { provide: KnowledgeAgentService, useValue: knowledgeService },
        { provide: GroqService, useValue: groqService },
        { provide: RedisLoggerService, useValue: loggerService },
      ],
    }).compile();

    service = module.get<RouterAgentService>(RouterAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should route to KnowledgeAgent for non-math questions', async () => {
    const message = 'What is the current interest rate?';
    
    const result = await service.routeAndHandle(message);
    
    expect(groqService.chatCompletion).toHaveBeenCalled();
    expect(knowledgeService.answer).toHaveBeenCalledWith(message, []);
    expect(result.chosenAgent).toBe('KnowledgeAgent');
    expect(result.agentResult.responseMsg).toContain('answer');
  });

  it('should route to MathAgent for math questions', async () => {
    groqService.chatCompletion = jest.fn().mockResolvedValue({
      responseMsg: 'MathAgent',
      data: {}
    });

    const message = '2 + 2 = ?';
    
    const result = await service.routeAndHandle(message);
    
    expect(groqService.chatCompletion).toHaveBeenCalled();
    expect(mathService.solve).toHaveBeenCalledWith(message);
    expect(result.chosenAgent).toBe('MathAgent');
    expect(result.agentResult.responseMsg).toContain('42');
  });

  it('should fallback to KnowledgeAgent on routing error', async () => {
    groqService.chatCompletion = jest.fn().mockRejectedValue(new Error('API Error'));

    const message = 'What is 2 + 2?';
    
    const result = await service.routeAndHandle(message);
    
    expect(knowledgeService.answer).toHaveBeenCalledWith(message, []);
    expect(result.chosenAgent).toBe('KnowledgeAgent');
  });
});
