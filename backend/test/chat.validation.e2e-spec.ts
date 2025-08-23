import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('Chat Validation (e2e)', () => {
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

  it('/chat (POST) - empty message', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: '' })
      .expect(400);
  });

  it('/chat (POST) - whitespace only message', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: '   ' })
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
