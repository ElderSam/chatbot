import { Injectable } from '@nestjs/common';
import { MathAgentService } from '../math-agent/math-agent.service';

// ### 2.1. 🔀 RouterAgent
// - Receives user messages.
// - Decides which agent should answer: **KnowledgeAgent** or **MathAgent**.
// - Generates structured logs with decision details.

@Injectable()
export class RouterAgentService {
  constructor(
    private readonly mathAgent: MathAgentService,
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
      // result = ...
    }

    if(!result) result = 'Not implemented yet';

    return { agent, result };
  }
}
