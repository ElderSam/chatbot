import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  // Shared test data for chat
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

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello to ChatBot!');
  });

});
