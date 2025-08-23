import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { RouterAgentService } from '../agents/router-agent/router-agent.service';

describe('ChatController', () => {
  let controller: ChatController;
  let routerAgentService: jest.Mocked<RouterAgentService>;

  // Shared test data for chat
  const chatPayload = {
    message: 'Qual a taxa da maquininha?',
    user_id: 'client789',
    conversation_id: 'conv-1234',
  };

  beforeEach(async () => {
    routerAgentService = {
      routeAndHandle: jest.fn().mockResolvedValue({
        chosenAgent: 'KnowledgeAgent',
        agentResult: {
          responseMsg: 'A taxa da maquininha varia conforme o plano...',
          data: { articles: [] }
        }
      })
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: RouterAgentService, useValue: routerAgentService },
      ],
    }).compile();
    
    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return correct workflow and response for valid payload', async () => {
    // Unit test: focus on controller logic only
    const result = await controller.handleChat(chatPayload) as any;

    expect(typeof result.response).toBe('string');
    expect(typeof result.source_agent_response).toBe('object');

    expect(result.agent_workflow[0]).toEqual({ 
      agent: 'RouterAgent', 
      decision: expect.stringMatching(/(KnowledgeAgent|MathAgent)/) 
    });
    expect(result.agent_workflow[1]).toEqual({ 
      agent: expect.stringMatching(/(KnowledgeAgent|MathAgent)/) 
    });
  });

  it('should handle routing to MathAgent', async () => {
    routerAgentService.routeAndHandle = jest.fn().mockResolvedValue({
      chosenAgent: 'MathAgent',
      agentResult: {
        responseMsg: '42',
        data: { calculation: '40 + 2 = 42' }
      }
    });

    const mathPayload = {
      message: '20 + 22 = ?',
      user_id: 'client789',
      conversation_id: 'conv-1234',
    };

    const result = await controller.handleChat(mathPayload) as any;

    expect(result.agent_workflow[0].decision).toBe('MathAgent');
    expect(result.agent_workflow[1].agent).toBe('MathAgent');
  });

  // Validation errors are tested in e2e, not unit tests
});
