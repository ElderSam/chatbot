import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GroqService } from '../groq/groq.service';
import { ChatCompletionResponse } from '../groq/groq.types';
import { RedisLoggerService } from '../../redis/redis-logger/redis-logger.service';


@Injectable()
export class MathAgentService {
  constructor(
    cfg: ConfigService, 
    private groq: GroqService,
    private logger: RedisLoggerService
  ) {}

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

  async solve(message: string, userContext?: { user_id?: string; conversation_id?: string }): Promise<ChatCompletionResponse> {
    const start = Date.now();
    
    try {
      const res = await this.calculateMathExpression(message);
      const executionTime = Date.now() - start;
      
      await this.logger.info('MathAgent', {
        message,
        responseMsg: res.responseMsg,
        execution_time: executionTime,
        ...userContext
      });
      
      return res;
    } catch (error) {
      const executionTime = Date.now() - start;
      
      await this.logger.error('MathAgent', {
        message,
        error: error.message,
        execution_time: executionTime,
        ...userContext
      });
      
      throw error;
    }
  }
}
