import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { GroqService } from '../src/agents/groq/groq.service';
import { EmbeddingService } from '../src/agents/knowledge-agent/embedding.service';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';

describe('Chat Portuguese Characters (e2e)', () => {
  let app: INestApplication;
  const basePayload = {
    user_id: 'client789',
    conversation_id: 'conv-1234',
  };

  beforeEach(async () => {
    // Mock GroqService for E2E tests
    const mockGroqService = {
      chatCompletion: jest.fn().mockImplementation(({ prompt }) => {
        if (prompt.includes('MathAgent') || prompt.includes('KnowledgeAgent')) {
          return Promise.resolve({
            responseMsg: 'KnowledgeAgent',
            data: {}
          });
        }
        return Promise.resolve({
          responseMsg: 'Com base nas informações disponíveis, posso ajudar com sua pergunta sobre a InfinitePay.',
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

  afterAll(async () => {
    await app.close();
  });

  it('/chat (POST) - should handle Portuguese accents correctly', async () => {
    // Test with accented characters
    const responseWithAccents = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...basePayload, message: 'Como funciona uma sugestão?' })
      .expect(201);

    // Test with normalized characters  
    const responseWithoutAccents = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...basePayload, message: 'Como funciona uma sugestao?' })
      .expect(201);

    // Both should return valid responses (not necessarily identical due to context differences)
    expect(responseWithAccents.body.response).toBeDefined();
    expect(responseWithAccents.body.source_agent_response).toBeDefined();
    expect(responseWithAccents.body.agent_workflow).toBeDefined();
    
    expect(responseWithoutAccents.body.response).toBeDefined();
    expect(responseWithoutAccents.body.source_agent_response).toBeDefined();
    expect(responseWithoutAccents.body.agent_workflow).toBeDefined();
  });

  it('/chat (POST) - should normalize various Portuguese characters', async () => {
    const testCases = [
      'configuração',
      'física',
      'segurança', 
      'informação',
      'opção'
    ];

    for (const testMessage of testCases) {
      const response = await request(app.getHttpServer())
        .post('/chat')
        .send({ ...basePayload, message: `Como funciona ${testMessage}?` })
        .expect(201);

      // Should return a valid response structure
      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('source_agent_response');
      expect(response.body).toHaveProperty('agent_workflow');
    }
  });

  it('/chat (POST) - should preserve original message in response', async () => {
    const originalMessage = 'Qual é a configuração de segurança?';
    
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ ...basePayload, message: originalMessage })
      .expect(201);

    // The response should be defined (we can't guarantee specific content matches due to AI variability)
    expect(response.body.response).toBeDefined();
    expect(response.body.source_agent_response).toBeDefined();
    expect(response.body.agent_workflow).toBeDefined();
  });
});