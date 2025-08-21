import { Injectable } from '@nestjs/common';
// import { RedisLoggerService } from 'src/redis-logger/redis-logger.service';

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
  // constructor(private logger: RedisLoggerService) {}

  async answer(question: string): Promise<string> {
    const start = Date.now();
    // TODO: implementar RAG no próximo passo
    const answer = `Resposta simulada para: ${question}`;
    const executionTimeMs = Date.now() - start;

    // await this.logger.log('knowledge-agent', {
    //   question,
    //   sources: [],            // no RAG vamos preencher
    //   executionTimeMs,
    // });

    return answer;
  }
}