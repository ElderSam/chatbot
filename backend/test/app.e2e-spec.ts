import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { GroqService } from '../src/agents/groq/groq.service';
import { EmbeddingService } from '../src/agents/knowledge-agent/embedding.service';
import { ConfigService } from '@nestjs/config';
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
    // Mock GroqService for E2E tests
    const mockGroqService = {
      chatCompletion: jest.fn().mockResolvedValue({
        responseMsg: 'KnowledgeAgent',
        data: {}
      })
    };

    // Mock EmbeddingService
    const mockEmbeddingService = {
      generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3, 0.4]),
      findMostRelevantArticles: jest.fn().mockResolvedValue([
        {
          title: 'Test Article',
          url: 'https://test.com/article',
          text: 'This is a test article content',
        }
      ]),
      storeArticleEmbeddings: jest.fn().mockResolvedValue(undefined)
    };

    // Mock ConfigService
    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'REDIS_HOST':
            return 'localhost';
          case 'REDIS_PORT':
            return '6379';
          case 'GROQ_API_KEY':
            return 'mock-groq-key';
          case 'HUGGINGFACE_API_KEY':
            return 'mock-hf-key';
          default:
            return null;
        }
      })
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(GroqService)
    .useValue(mockGroqService)
    .overrideProvider(EmbeddingService)
    .useValue(mockEmbeddingService)
    .overrideProvider(ConfigService)
    .useValue(mockConfigService)
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
