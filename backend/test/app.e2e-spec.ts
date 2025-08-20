import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('AppController (e2e)', () => {
// Shared test data for chat
const chatPayload = {
  message: 'Qual a taxa da maquininha?',
  user_id: 'client789',
  conversation_id: 'conv-1234',
};

  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello to ChatBot!');
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

  it('/chat (POST) - missing body', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send()
      .expect(400);
  });

  it('/chat (POST) - invalid message type', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: 123 })
      .expect(400);
  });

  it('/chat (POST) - invalid user_id type', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, user_id: 123 })
      .expect(400);
  });

  it('/chat (POST) - invalid user_id format', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, user_id: 'user123' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, user_id: 'clientabc' })
      .expect(400);
  });

  it('/chat (POST) - invalid conversation_id type', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, conversation_id: 123 })
      .expect(400);
  });

  it('/chat (POST) - invalid conversation_id format', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, conversation_id: 'conv-abc' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, conversation_id: 'conversation-123' })
      .expect(400);
  });
});
