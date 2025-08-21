import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

import { MathAgentService } from '../math-agent/math-agent.service';
import { KnowledgeAgentService } from '../knowledge-agent/knowledge-agent.service';
// import { RedisLoggerService } from 'src/redis-logger/redis-logger.service';

// ### 2.1. 🔀 RouterAgent
// - Receives user messages.
// - Decides which agent should answer: **KnowledgeAgent** or **MathAgent**.
// - Generates structured logs with decision details.

interface HandleQueryResponse {
  chosenAgent: 'MathAgent' | 'KnowledgeAgent';
  result: string;
}

@Injectable()
export class RouterAgentService {
  private client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  });

  constructor(
    private readonly mathAgent: MathAgentService,
    private readonly knowledgeAgent: KnowledgeAgentService,
    // private readonly logger: RedisLoggerService,
  ) {}

  async route(query: string): Promise<'MathAgent' | 'KnowledgeAgent'> {
    // const prompt = `
    //   You are a RouterAgent. Your job is to decide which agent should handle a query.

    //   Agents:
    //   - MathAgent: for any simple math, calculations, numbers, or formulas.
    //   - KnowledgeAgent: for general knowledge, facts, or information.

    //   Query: "${query}"

    //   Return ONLY "MathAgent" or "KnowledgeAgent".
    // `;

    try {
      // const response = await this.client.chat.completions.create({
      //   model: 'mistralai/mistral-7b-instruct',
      //   messages: [{ role: 'user', content: prompt }],
      //   temperature: 0,
      // });

      // const choice = response.choices[0].message.content?.trim();
      // // Optionally log usage
      // if (response.usage?.completion_tokens && response.usage?.total_tokens) {
      //   const percentUsage = (response.usage.completion_tokens * 100) / response.usage.total_tokens;
      //   console.log(`NOTE: usage = ${percentUsage}%`);
      // }

      let choice = 'KnowledgeAgent';
      // Improved regex to detect mathematical expressions with numbers, operators, parentheses, and decimals
      const mathRegex = /^[\d\s\+\-\*\/\.\(\)]+$/;
      // Also considers phrases in English for math intent detection
      const mathKeywords = [
        'how much is',
        'calculate',
        'what is the result of',
        'result of',
        'sum',
        'add',
        'multiply',
        'divide',
        'subtract',
      ];

      if (
        mathRegex.test(query.trim()) ||
        mathKeywords.some((kw) => query.toLowerCase().includes(kw))
      ) {
        choice = 'MathAgent';
      }

      if (choice === 'MathAgent') return 'MathAgent';
      return 'KnowledgeAgent';

    } catch (error: any) {
      // Propagate the error to the controller
      throw error;
    }
  }

  async handleQuery(query: string): Promise<HandleQueryResponse> {
    const chosenAgent = await this.route(query);
    let result: string = '';

    if (chosenAgent === 'MathAgent') {
      result = await this.mathAgent.calculate(query);
    }
    else {
      result = await this.knowledgeAgent.answer(query);
    }

    return { chosenAgent, result };
  }
}
