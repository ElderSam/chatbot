import { Injectable } from '@nestjs/common';
import { GroqService } from '../groq/groq.service';
import { loadDynamicContext, ArticleContext, setRedisCacheService } from './context-loader';
import { RedisLoggerService } from '../../redis/redis-logger/redis-logger.service';
import { RedisCacheService } from '../../redis/redis-cache/redis-cache.service';

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
    private readonly groq: GroqService,
    private readonly redisCache: RedisCacheService
  ) {
    setRedisCacheService(this.redisCache);
  }

  async answer(question: string, context?: ArticleContext[]) {
    const start = Date.now();
    // Carrega contexto dos artigos relevantes se não fornecido
    const limitedContext = (
      (context && context.length > 0) 
      ? context 
      : await loadDynamicContext(question)
    )
    .slice(0, 3);


    // const contextText = limitedContext.map(a => {
    //   return `Título: ${a.title}\nLink: ${a.url}\nTrecho: ${a.text.slice(0, 500)}`
    // }).join('\n\n');

    const contextText = limitedContext.map(
      (a, i) => `Artigo ${i + 1}: ${a.title}\nURL: ${a.url}\n${a.text}\n`
    ).join('\n');
    
    const mainLink = limitedContext.length > 0 ? limitedContext[0].url : '';

    const prompt = `
      Answer the user's question as a friendly chatbot assistant. Be direct and natural. If you do not know the answer, say you do not have that information right now, but suggest the user check the link below for more details. Do not mention articles or the search process.
      Question: "${question}"

      Context:
      ${contextText}
    `;

    // const prompt = `You are an assistant that answers questions based only on the provided content.
    //   \nRespond objectively and concisely. If you do not know the exact answer, explicitly cite the most relevant link for reference: ${mainLink}
    //   \n\nAvailable content:
    //   \n${contextText}
    //   \n\nQuestion: ${question}
    // `;

    console.log('KnowledgeAgentService - answer:');

    // TODO. remover?. teste temporário
    if(!limitedContext.length) {
      console.warn('KnowledgeAgentService - No context available, loading dynamic context...');
      return { responseMsg: 'Content not found', data: {} }
    }

    // Calls LLM to generate answer
    const { responseMsg, data } = await this.groq.chatCompletion({prompt});
    
    console.log({ responseMsg, mainLink })

    let finalMessage = responseMsg?.trim() || 'Consulte o site da InfinitePay para mais detalhes.';
    // Se houver link relevante, inclua de forma natural
    if (mainLink && !finalMessage.includes(mainLink)) {
        finalMessage += `\nSaiba mais: ${mainLink}`;
    }

    const finalResponse = { responseMsg: finalMessage, data };

    const executionTimeMs = Date.now() - start;

    await this.logger.log('knowledge-agent', {
      question, ...finalResponse,
      sources: limitedContext.map(a => a.url),
      executionTimeMs,
    });

    return finalResponse;
  }
}