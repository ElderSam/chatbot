import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppFactory, CommonTestPayloads } from './utils/test-app.factory';

describe('Chat Sanitization (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await TestAppFactory.createApp({ 
      groqServiceOptions: { type: 'sanitization' }
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('/chat (POST) - sanitizes HTML tags', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...CommonTestPayloads.validChat, message: '<b>bold</b>' })
      .expect(201);
    expect(response.body.response).toBe('bold.');
  });

  it('/chat (POST) - sanitizes script tags', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...CommonTestPayloads.validChat, message: "<script>alert('hack');</script>hello" })
      .expect(201);
    expect(response.body.response).toBe('hello.');
  });

  it('/chat (POST) - sanitizes event handlers', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...CommonTestPayloads.validChat, message: "<img src='x' onerror='alert(1)'>image" })
      .expect(201);
    expect(response.body.response).toBe('image.');
  });

  it('/chat (POST) - sanitizes javascript href', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...CommonTestPayloads.validChat, message: '<a href="javascript:alert(\'xss\')">click</a>' })
      .expect(201);
    expect(response.body.response).toBe('click.');
  });

  it('/chat (POST) - sanitizes style tags', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...CommonTestPayloads.validChat, message: '<style>body{background:red;}</style>hello' })
      .expect(201);
    expect(response.body.response).toBe('hello.');
  });

  it('/chat (POST) - sanitizes unknown tags', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...CommonTestPayloads.validChat, message: "<iframe src='evil.com'></iframe>safe" })
      .expect(201);
    expect(response.body.response).toBe('safe.');
  });
});
