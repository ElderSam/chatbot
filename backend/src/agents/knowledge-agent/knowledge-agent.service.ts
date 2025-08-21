import { Injectable } from '@nestjs/common';
import { RedisLoggerService } from 'src/redis-logger/redis-logger.service';
import { GroqService } from '../groq/groq.service';

/* TODO
 ### 2.2. 📚 KnowledgeAgent
 - Uses **RAG (Retrieval-Augmented Generation)** based on content from:
   - [https://ajuda.infinitepay.io/pt-BR/](https://ajuda.infinitepay.io/pt-BR/)
 - May use **LangChain**, **LlamaIndex**, or similar.
 - Must log:
   - Source of the answer
   - Execution time
*/

@Injectable()
export class KnowledgeAgentService {
  constructor(
    private logger: RedisLoggerService,
    private readonly groq: GroqService
  ) {}


  async answer(question: string, context: string[]) {
    const start = Date.now();

    const prompt = `
      Você é um assistente que responde perguntas com base apenas no conteúdo fornecido.
      Use as informações abaixo para responder a pergunta do usuário.
      Se não souber, diga "Não encontrei essa informação nos artigos".
      
      Conteúdo disponível:
      ${context.join('\n\n')}
    `;

    const answer = await this.groq.chatCompletion({prompt});

    const executionTimeMs = Date.now() - start;

    await this.logger.log('knowledge-agent', {
      question,
      sources: [],            // no RAG vamos preencher
      executionTimeMs,
    });

    return answer;
  }
}