import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { GroqService } from '../src/agents/groq/groq.service';
import { EmbeddingService } from '../src/agents/knowledge-agent/embedding.service';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';

describe('Chat Sanitization (e2e)', () => {
  let app: INestApplication;
  const chatPayload = {
    message: 'Qual a taxa da maquininha?',
    user_id: 'client789',
    conversation_id: 'conv-1234',
  };

  beforeEach(async () => {
    // Mock GroqService for E2E tests - retorna diretamente o texto sanitizado
    const mockGroqService = {
      chatCompletion: jest.fn().mockImplementation(({ prompt }) => {
        // Extrai a questão do prompt usando o formato "QUESTION: "
        const questionMatch = prompt.match(/QUESTION:\s*(.+?)(?:\n|$)/);
        if (questionMatch) {
          const question = questionMatch[1].trim();
          // Adiciona um ponto final para evitar que o KnowledgeAgentService adicione "..."
          const finalQuestion = question.endsWith('.') ? question : question + '.';
          return Promise.resolve({
            responseMsg: finalQuestion, // Retorna a questão com ponto final
            data: {}
          });
        }
        
        // Fallback para outros casos
        return Promise.resolve({
          responseMsg: 'Default response.',
          data: {}
        });
      })
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

  it('/chat (POST) - sanitizes HTML tags', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: '<b>bold</b>' })
      .expect(201);
    expect(response.body.response).toBe('bold.');
  });

  it('/chat (POST) - sanitizes script tags', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: "<script>alert('hack');</script>hello" })
      .expect(201);
    expect(response.body.response).toBe('hello.');
  });

  it('/chat (POST) - sanitizes event handlers', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: "<img src='x' onerror='alert(1)'>image" })
      .expect(201);
    expect(response.body.response).toBe('image.');
  });

  it('/chat (POST) - sanitizes javascript href', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: '<a href="javascript:alert(\'xss\')">click</a>' })
      .expect(201);
    expect(response.body.response).toBe('click.');
  });

  it('/chat (POST) - sanitizes style tags', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: '<style>body{background:red;}</style>hello' })
      .expect(201);
    expect(response.body.response).toBe('hello.');
  });

  it('/chat (POST) - sanitizes unknown tags', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...chatPayload, message: "<iframe src='evil.com'></iframe>safe" })
      .expect(201);
    expect(response.body.response).toBe('safe.');
  });
});
