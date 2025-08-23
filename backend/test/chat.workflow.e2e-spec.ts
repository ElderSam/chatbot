import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppFactory, CommonTestPayloads } from './utils/test-app.factory';

describe('Chat Workflow (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await TestAppFactory.createApp({ 
      groqServiceOptions: { type: 'workflow' }
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('should complete full workflow for knowledge question', () => {
    return request(app.getHttpServer())
      .post('/chat')
      .send(CommonTestPayloads.validChat)
      .expect(201)
      .expect((res) => {
        expect(res.body.response).toBeDefined();
        expect(res.body.agent_workflow).toBeDefined();
        expect(res.body.agent_workflow).toContainEqual({
          agent: 'RouterAgent',
          decision: expect.any(String)
        });
        expect(res.body.agent_workflow.length).toBeGreaterThan(1);
      });
  });
});
