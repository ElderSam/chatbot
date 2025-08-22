import { Injectable } from '@nestjs/common';
import { MathAgentService } from '../math-agent/math-agent.service';
import { KnowledgeAgentService } from '../knowledge-agent/knowledge-agent.service';
import { GroqService } from '../groq/groq.service';
import { RedisLoggerService } from 'src/redis/redis-logger/redis-logger.service';
import { ChatCompletionResponse } from '../groq/groq.types';

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
  const prompt = `You are a strict router for a modular chatbot. Only return "MathAgent" if the user's query is a clear, explicit math calculation (with numbers and operators or math words). For all other cases, return "KnowledgeAgent". Respond with only one word: "MathAgent" or "KnowledgeAgent".\nQuery: """${q}"""`;

    try {
      const { responseMsg } = await this.groq.chatCompletion({ prompt });

      return (responseMsg === 'MathAgent') ? 'MathAgent' : 'KnowledgeAgent';
    }
    catch(error) {
      console.error('Error deciding agent:', error);
      return 'KnowledgeAgent';
    }
  }

  async routeAndHandle(message: string): Promise<{ chosenAgent: Route; agentResult: ChatCompletionResponse }> {
    // route = 'KnowledgeAgent'; // TODO. apagar. É só um teste temporário para economizar tokens

    const route = await this.decideAgent(message);

    console.log(`Routing decision: ${route}`);

    let agentResult: ChatCompletionResponse;

    // TODO. descomentar isso?
    if (route === 'MathAgent') {
      agentResult = await this.math.solve(message);
    }
    else {
      agentResult = await this.knowledge.answer(message, []);
    }

    await this.logger.log('router-agent', {
      message, chosenAgent: route, agentResult,
      ts: new Date().toISOString(),
    });

    return { chosenAgent: route, agentResult };
  }
}
