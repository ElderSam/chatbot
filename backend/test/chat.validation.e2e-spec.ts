import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppFactory, CommonTestPayloads } from './utils/test-app.factory';

describe('Chat Validation (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await TestAppFactory.createApp();
  });

  afterEach(async () => {
    await app.close();
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
      .send({ ...CommonTestPayloads.validChat, message: 123 })
      .expect(400);
  });

  it('/chat (POST) - empty message', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...CommonTestPayloads.validChat, message: '' })
      .expect(400);
  });

  it('/chat (POST) - whitespace only message', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...CommonTestPayloads.validChat, message: '   ' })
      .expect(400);
  });

  it('/chat (POST) - invalid user_id type', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...CommonTestPayloads.validChat, user_id: 123 })
      .expect(400);
  });

  it('/chat (POST) - invalid user_id format', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...CommonTestPayloads.validChat, user_id: 'user123' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...CommonTestPayloads.validChat, user_id: 'clientabc' })
      .expect(400);
  });

  it('/chat (POST) - invalid conversation_id type', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...CommonTestPayloads.validChat, conversation_id: 123 })
      .expect(400);
  });

  it('/chat (POST) - invalid conversation_id format', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...CommonTestPayloads.validChat, conversation_id: 'conv-abc' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...CommonTestPayloads.validChat, conversation_id: 'conversation-123' })
      .expect(400);
  });
});
