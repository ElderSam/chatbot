import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

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

  it('/chat (POST)', async () => {
    const payload = {
      message: 'Qual a taxa da maquininha?',
      user_id: 'client789',
      conversation_id: 'conv-1234',
    };
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send(payload)
      .expect(201);
    expect(response.body).toHaveProperty('response');
    expect(response.body).toHaveProperty('source_agent_response');
    expect(response.body).toHaveProperty('agent_workflow');
    expect(Array.isArray(response.body.agent_workflow)).toBe(true);
  });
});
