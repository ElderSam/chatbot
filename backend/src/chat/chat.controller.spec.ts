import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';

describe('ChatController', () => {
  let controller: ChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return expected response for POST /chat', () => {
    const payload = {
      message: 'Qual a taxa da maquininha?',
      user_id: 'client789',
      conversation_id: 'conv-1234',
    };
    const result = controller.handleChat(payload);
    expect(result).toHaveProperty('response');
    expect(result).toHaveProperty('source_agent_response');
    expect(result).toHaveProperty('agent_workflow');
    expect(Array.isArray(result.agent_workflow)).toBe(true);
  });
});
