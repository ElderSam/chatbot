import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

// import { MathAgentService } from '../math-agent/math-agent.service';
// import { KnowledgeAgentService } from '../knowledge-agent/knowledge-agent.service';
// import { RedisLoggerService } from 'src/redis-logger/redis-logger.service';

// ### 2.1. 🔀 RouterAgent
// - Receives user messages.
// - Decides which agent should answer: **KnowledgeAgent** or **MathAgent**.
// - Generates structured logs with decision details.

@Injectable()
export class RouterAgentService {
  private client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  });

  constructor(
    // private readonly mathAgent: MathAgentService,
    // private readonly knowledgeAgent: KnowledgeAgentService,
    // private readonly logger: RedisLoggerService,
  ) {}

  async route(query: string): Promise<'MathAgent' | 'KnowledgeAgent'> {
    const prompt = `
      You are a RouterAgent. Your job is to decide which agent should handle a query.

      Agents:
      - MathAgent: for any simple math, calculations, numbers, or formulas.
      - KnowledgeAgent: for general knowledge, facts, or information.

      Query: "${query}"

      Return ONLY "MathAgent" or "KnowledgeAgent".
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });

      const choice = response.choices[0].message.content?.trim();
      // Optionally log usage
      if (response.usage?.completion_tokens && response.usage?.total_tokens) {
        const percentUsage = (response.usage.completion_tokens * 100) / response.usage.total_tokens;
        console.log(`NOTE: usage = ${percentUsage}%`);
      }

      if (choice === 'MathAgent') return 'MathAgent';
      return 'KnowledgeAgent';

    } catch (error: any) {
      // Propaga o erro para o controller
      throw error;
    }
  }
}
