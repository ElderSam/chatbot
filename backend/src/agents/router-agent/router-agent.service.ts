import { Injectable } from '@nestjs/common';
import { MathAgentService } from '../math-agent/math-agent.service';
import { KnowledgeAgentService } from '../knowledge-agent/knowledge-agent.service';
import { GroqService } from '../groq/groq.service';
import { RedisLoggerService } from 'src/redis/redis-logger/redis-logger.service';

type Route = 'MathAgent' | 'KnowledgeAgent';

@Injectable()
export class RouterAgentService {
  constructor(
    private math: MathAgentService,
    private knowledge: KnowledgeAgentService,
    private groq: GroqService,
    private logger: RedisLoggerService,
  ) { }

  private async decideAgent(q: string): Promise<Route> {
    const prompt = `You are a strict router. Decide what agent should I call, returning only "MathAgent" or "KnowledgeAgent".\nQuery: """${q}"""`;

    try {
      const text = await this.groq.chatCompletion({ prompt });

      const p = JSON.parse(text);
      return p === 'MathAgent' ? 'MathAgent' : 'KnowledgeAgent';
    }
    catch {
      return 'KnowledgeAgent';
    }
  }

  async routeAndHandle(message: string) {
    // route = 'KnowledgeAgent'; // TODO. apagar. É só um teste temporário para economizar tokens

    const route = await this.decideAgent(message);

    console.log(`Routing decision: ${route}`);

    let agentResult: string;

    // TODO. descomentar isso?
    if (route === 'MathAgent') {
      agentResult = await this.math.solve(message);
    }
    else {
      const { answer } = await this.knowledge.answer(message, []);
      agentResult = answer;
    }

    await this.logger.log('router-agent', {
      message, chosenAgent: route, agentResult,
      ts: new Date().toISOString(),
    });

    return { chosenAgent: route, result: agentResult };
  }
}
