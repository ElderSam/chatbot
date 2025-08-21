import { Injectable } from '@nestjs/common';
import { MathAgentService } from '../math-agent/math-agent.service';
import { KnowledgeAgentService } from '../knowledge-agent/knowledge-agent.service';
import { GroqService } from '../groq/groq.service';
// import { RedisLoggerService } from 'src/redis-logger/redis-logger.service';

type Route = 'MathAgent' | 'KnowledgeAgent';

@Injectable()
export class RouterAgentService {
  constructor(
    private math: MathAgentService,
    private knowledge: KnowledgeAgentService,
    private groq: GroqService,
    // private logger: RedisLoggerService,
  ) {}

  private heuristicRoute(q: string): { route: Route; confidence: number; reason: string } {
    // Normalize input: treat x/X/× as *
    let s = q.toLowerCase().trim().replace(/[x×]/g, '*');

    const mathOps = ['+', '-', '*', '/', '^', '%'];

    const mathWords = ['somar','subtrair','multiplicar','dividir','porcent','porcentagem',
      'raiz','potência','calculate','sum','minus','times','divide','percentage'];

    const hasOp = mathOps.some(op => s.includes(op));
    const hasDigit = /\d/.test(s);
    const hasMathWord = mathWords.some(w => s.includes(w));

    if ((hasDigit && hasOp) || hasMathWord) {
      return { route: 'MathAgent', confidence: 0.9, reason: 'digits+operator or math word' };
    }

    return { route: 'KnowledgeAgent', confidence: 0.7, reason: 'no math pattern' };
  }

  private async llmFallbackRoute(q: string): Promise<Route> {
    const prompt = `You are a strict router. Decide MATH or KNOWLEDGE.\nReturn ONLY JSON: {"route":"MathAgent"} or {"route":"KnowledgeAgent"}.\nQuery: """${q}"""`;
    try {
      const text = await this.groq.chatCompletion({ prompt, model: 'llama-3.1-8b-instant', temperature: 0, max_tokens: 8 });
      const p = JSON.parse(text);
      return p.route === 'MathAgent' ? 'MathAgent' : 'KnowledgeAgent';
    } catch {
      return 'KnowledgeAgent';
    }
  }

  async routeAndHandle(message: string) {
    const h = this.heuristicRoute(message);
    let route: Route = h.route;
    if (h.confidence < 0.85) route = await this.llmFallbackRoute(message);

    // await this.logger.log('router-agent', {
    //   message, chosenAgent: route, reason: h.reason, confidence: h.confidence,
    //   usedLLM: h.confidence < 0.85, ts: new Date().toISOString(),
    // });

    const result = route === 'MathAgent'
      ? await this.math.solve(message)
      : await this.knowledge.answer(message);

    return { chosenAgent: route, result };
  }
}
