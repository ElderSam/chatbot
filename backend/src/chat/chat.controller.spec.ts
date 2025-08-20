import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';

describe('ChatController', () => {
  let controller: ChatController;

  // Shared test data for chat
  const chatPayload = {
    message: 'Qual a taxa da maquininha?',
    user_id: 'client789',
    conversation_id: 'conv-1234',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
    }).compile();
    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return correct workflow and response for valid payload', () => {
    // Unit test: focus on controller logic only
    const result = controller.handleChat(chatPayload);

    expect(typeof result.response).toBe('string');
    expect(typeof result.source_agent_response).toBe('string');

    expect(result.agent_workflow[0]).toEqual({ agent: 'RouterAgent', decision: expect.stringMatching(/(KnowledgeAgent|MathAgent)/) });
    expect(result.agent_workflow[1]).toEqual({ agent: expect.stringMatching(/(KnowledgeAgent|MathAgent)/) });
  });

  // Validation errors are tested in e2e, not unit tests
});
