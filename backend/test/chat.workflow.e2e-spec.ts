import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('Chat Workflow (e2e)', () => {
  let app: INestApplication;
  const chatPayload = {
    message: 'Qual a taxa da maquininha?',
    user_id: 'client789',
    conversation_id: 'conv-1234',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });


  it('/chat (POST) - valid payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send(chatPayload)
      .expect(201);

    expect(typeof response.body.response).toBe('string');
    expect(typeof response.body.source_agent_response).toBe('string');
    expect(response.body.agent_workflow[0]).toEqual({ agent: 'RouterAgent', decision: expect.stringMatching(/(KnowledgeAgent|MathAgent)/) });
    expect(response.body.agent_workflow[1]).toEqual({ agent: expect.stringMatching(/(KnowledgeAgent|MathAgent)/) });
  });
});
