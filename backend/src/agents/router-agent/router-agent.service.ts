import { Injectable } from '@nestjs/common';
import { MathAgentService } from '../math-agent/math-agent.service';
import { KnowledgeAgentService } from '../knowledge-agent/knowledge-agent.service';
import { RedisLoggerService } from 'src/redis-logger/redis-logger.service';

// ### 2.1. 🔀 RouterAgent
// - Receives user messages.
// - Decides which agent should answer: **KnowledgeAgent** or **MathAgent**.
// - Generates structured logs with decision details.

@Injectable()
export class RouterAgentService {
  constructor(
    private readonly mathAgent: MathAgentService,
    private readonly knowledgeAgent: KnowledgeAgentService,
    private readonly logger: RedisLoggerService,
  ) {}

  async route(message: string) {
    let result: any;
    let agent = 'unknown';

    // TODO. use a LLM or AI agent and remote this condition in the if bellow
    if (/^\d+ [\+\-\*\/] \d+$/.test(message)) {
      agent = 'math-agent';
      result = await this.mathAgent.calculate(message);
    }
    else {
      agent = 'knowledge-agent';
      result = await this.knowledgeAgent.answer(message);
    }

    await this.logger.log('router-agent', {
      message,
      chosenAgent: agent,
      timestamp: new Date().toISOString(),
    });

    if(!result) result = 'Not implemented yet';

    return { agent, result };
  }
}
