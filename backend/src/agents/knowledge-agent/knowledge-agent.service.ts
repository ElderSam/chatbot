import { Injectable } from '@nestjs/common';
import { RedisLoggerService } from 'src/redis-logger/redis-logger.service';
import { GroqService } from '../groq/groq.service';
import { loadDynamicContext } from './context-loader';

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


  async answer(question: string, context?: string[]) {
    const start = Date.now();
    // Carrega contexto dos artigos da maquininha se não fornecido
  const knowledgeContext = context && context.length > 0 ? context : await loadDynamicContext(question);
    const prompt = `Você é um assistente que responde perguntas com base apenas no conteúdo fornecido.\nUse as informações abaixo para responder a pergunta do usuário.\nSe não souber, diga \"Não encontrei essa informação nos artigos\".\n\nConteúdo disponível:\n${knowledgeContext.join('\n\n')}\n\nPergunta: ${question}`;

    const answer = await this.groq.chatCompletion({prompt});

    const executionTimeMs = Date.now() - start;
    await this.logger.log('knowledge-agent', {
      question,
      sources: knowledgeContext.map((_, i) => `artigo_${i}`),
      executionTimeMs,
    });
    return answer;
  }
}