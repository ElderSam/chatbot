import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GroqService } from '../groq/groq.service';
import { ChatCompletionResponse } from '../groq/groq.types';


@Injectable()
export class MathAgentService {
  constructor(cfg: ConfigService, private groq: GroqService) {}

  // TODO. Não faz sentido isso. Deveria chamar o LLM direto para responder a pergunta matemática.
  private async calculateMathExpression(message: string): Promise<ChatCompletionResponse> {
    const prompt = `Calculate the following math expression and reply ONLY with the result (number, no explanation): """${message}"""`;
    try {
      let mathRes = await this.groq.chatCompletion({ prompt });
      return mathRes;
    }
    catch(error) {
      console.error('Error calculating math expression:', error);
      return { responseMsg: 'Error calculating math expression', data: { error } };
    }
  }

  async solve(message: string): Promise<ChatCompletionResponse> {
    const res = await this.calculateMathExpression(message);
    return res;
  }
}
