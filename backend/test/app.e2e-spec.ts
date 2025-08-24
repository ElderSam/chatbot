import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { GroqService } from '../src/agents/groq/groq.service';
import { EmbeddingService } from '../src/agents/knowledge-agent/embedding.service';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { createTestModuleConfig } from './utils/common-mocks';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  // Shared test data for chat
  const chatPayload = {
    message: 'Qual a taxa da maquininha?',
    user_id: 'client789',
    conversation_id: 'conv-1234',
  };

  beforeEach(async () => {
    // Use centralized mock configuration
    const mocks = createTestModuleConfig({
      groqService: {
        chatCompletion: jest.fn().mockResolvedValue({
          responseMsg: 'KnowledgeAgent',
          data: {}
        })
      }
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(GroqService)
    .useValue(mocks.groqService)
    .overrideProvider(EmbeddingService)
    .useValue(mocks.embeddingService)
    .overrideProvider(ConfigService)
    .useValue(mocks.configService)
    .compile();
    
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true 
    }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello to ChatBot!');
  });

});
