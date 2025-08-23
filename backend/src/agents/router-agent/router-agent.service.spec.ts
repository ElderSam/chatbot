import { RouterAgentService } from './router-agent.service';
import { MathAgentService } from '../math-agent/math-agent.service';
import { KnowledgeAgentService } from '../knowledge-agent/knowledge-agent.service';
import { GroqService } from '../groq/groq.service';
import { RedisLoggerService } from '../../redis/redis-logger/redis-logger.service';
import { UnitTestFactory, CommonMockData } from '../../../test/utils/unit-test.factory';

describe('RouterAgentService', () => {
  let service: RouterAgentService;
  let mathService: jest.Mocked<MathAgentService>;
  let knowledgeService: jest.Mocked<KnowledgeAgentService>;
  let groqService: jest.Mocked<GroqService>;
  let loggerService: jest.Mocked<RedisLoggerService>;

  beforeEach(async () => {
    const module = await UnitTestFactory.createTestingModule({
      providers: [
        RouterAgentService,
        MathAgentService,
        KnowledgeAgentService,
        GroqService,
        RedisLoggerService,
      ],
      customMocks: {
        groqService: {
          chatCompletion: jest.fn().mockResolvedValue(CommonMockData.groqResponses.routerDecision)
        }
      }
    });

    service = module.get<RouterAgentService>(RouterAgentService);
    mathService = module.get(MathAgentService);
    knowledgeService = module.get(KnowledgeAgentService);
    groqService = module.get(GroqService);
    loggerService = module.get(RedisLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should route to KnowledgeAgent for non-math questions', async () => {
    const message = 'What is the current interest rate?';
    const userContext = { user_id: 'test123', conversation_id: 'conv123' };
    
    const result = await service.routeAndHandle(message, userContext);
    
    expect(groqService.chatCompletion).toHaveBeenCalled();
    expect(knowledgeService.answer).toHaveBeenCalledWith(message, [], userContext);
    expect(result.chosenAgent).toBe('KnowledgeAgent');
    expect(result.agentResult.responseMsg).toContain('answer');
  });

  it('should route to MathAgent for math questions', async () => {
    groqService.chatCompletion = jest.fn().mockResolvedValue({
      responseMsg: 'MathAgent',
      data: {}
    });

    const message = '2 + 2 = ?';
    const userContext = { user_id: 'test123', conversation_id: 'conv123' };
    
    const result = await service.routeAndHandle(message, userContext);
    
    expect(groqService.chatCompletion).toHaveBeenCalled();
    expect(mathService.solve).toHaveBeenCalledWith(message, userContext);
    expect(result.chosenAgent).toBe('MathAgent');
    expect(result.agentResult.responseMsg).toContain('42');
  });

  it('should fallback to KnowledgeAgent on routing error', async () => {
    groqService.chatCompletion = jest.fn().mockRejectedValue(new Error('API Error'));

    const message = 'What is 2 + 2?';
    const userContext = { user_id: 'test123', conversation_id: 'conv123' };
    
    const result = await service.routeAndHandle(message, userContext);
    
    expect(knowledgeService.answer).toHaveBeenCalledWith(message, [], userContext);
    expect(result.chosenAgent).toBe('KnowledgeAgent');
  });
});
