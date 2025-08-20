import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('Chat Sanitization (e2e)', () => {
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

  it('/chat (POST) - sanitizes HTML tags', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: '<b>bold</b>' })
      .expect(201);
    expect(response.body.response).toBe('bold');
  });

  it('/chat (POST) - sanitizes script tags', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: "<script>alert('hack');</script>hello" })
      .expect(201);
    expect(response.body.response).toBe('hello');
  });

  it('/chat (POST) - sanitizes event handlers', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: "<img src='x' onerror='alert(1)'>image" })
      .expect(201);
    expect(response.body.response).toBe('image');
  });

  it('/chat (POST) - sanitizes javascript href', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: '<a href="javascript:alert(\'xss\')">click</a>' })
      .expect(201);
    expect(response.body.response).toBe('click');
  });

  it('/chat (POST) - sanitizes style tags', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: '<style>body{background:red;}</style>hello' })
      .expect(201);
    expect(response.body.response).toBe('hello');
  });

  it('/chat (POST) - sanitizes unknown tags', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: "<iframe src='evil.com'></iframe>safe" })
      .expect(201);
    expect(response.body.response).toBe('safe');
  });
});
