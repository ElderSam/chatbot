import { Injectable } from '@nestjs/common';
import { GroqService } from '../groq/groq.service';
import { loadDynamicContext, setRedisCacheService } from './context-loader';
import { EmbeddingService } from './embedding.service';
import { RedisLoggerService } from '../../redis/redis-logger/redis-logger.service';
import { RedisCacheService } from '../../redis/redis-cache/redis-cache.service';
import { ArticleContext } from './types';

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
    private readonly redisCache: RedisCacheService,
    private readonly embeddingService: EmbeddingService
  ) {
    setRedisCacheService(this.redisCache);
  }

  async answer(question: string, context?: ArticleContext[]) {
    const start = Date.now();
    
    try {
      // Primeiro, tenta buscar artigos relevantes usando embeddings semânticos
      let limitedContext = await this.embeddingService.findMostRelevantArticles(question, 3);
      
      // Se não encontrou artigos relevantes ou há poucos embeddings, carrega contexto dinamicamente
      if (limitedContext.length === 0) {
        console.log('No relevant articles found with embeddings, loading dynamic context...');
        const dynamicArticles = await loadDynamicContext(question);
        
        // Gera embeddings para os novos artigos e os salva no Redis
        if (dynamicArticles.length > 0) {
          await this.embeddingService.storeArticleEmbeddings(dynamicArticles);
          // Tenta novamente a busca por similaridade
          limitedContext = await this.embeddingService.findMostRelevantArticles(question, 3);
          
          // Se ainda não encontrou, usa os artigos carregados dinamicamente como fallback
          if (limitedContext.length === 0) {
            limitedContext = dynamicArticles.slice(0, 3);
          }
        }
      }

      // Se foi fornecido contexto específico, usa ele
      if (context && context.length > 0) {
        limitedContext = context.slice(0, 3);
      }

      console.log(`Using ${limitedContext.length} articles for context`);

      if (limitedContext.length === 0) {
        console.warn('KnowledgeAgentService - No context available');
        return { responseMsg: 'Desculpe, não encontrei informações relevantes sobre sua pergunta no momento. Por favor, consulte o site da InfinitePay para mais detalhes.', data: {} };
      }

      const contextText = limitedContext.map(
        (a, i) => `Artigo ${i + 1}: ${a.title}\nURL: ${a.url}\n${a.text}\n`
      ).join('\n');
      
      const mainLink = limitedContext[0].url;

      const prompt = `
        You are an InfinitePay assistant helping customers with information about products and services.

        Use ONLY the information from the context below to answer the user's question. Be direct, helpful, and natural.

        INSTRUCTIONS:
        - Answer based on the provided context
        - If the context contains the exact information, provide a complete answer
        - If the context does not contain the specific information OR you're not completely sure about the details, say that you don't have that specific information available and suggest the user check the provided link for complete details
        - Always provide the most relevant link from the context when you cannot give a complete answer
        - Do not mention "articles" or the search process
        - Be conversational and friendly
        - Provide specific information when available in the context
        - Answer in Portuguese

        QUESTION: "${question}"

        CONTEXT:
        ${contextText}

        ANSWER:
      `;

      console.log('KnowledgeAgentService - generating answer with LLM');

      // Calls LLM to generate answer
      const { responseMsg, data } = await this.groq.chatCompletion({prompt});
      
      console.log({ responseMsg: responseMsg?.substring(0, 100), mainLink });

      let finalMessage = responseMsg?.trim() || 'Consulte o site da InfinitePay para mais detalhes.';
      
      // Verifica se a resposta parece ter sido cortada e adiciona reticências
      if (finalMessage && !finalMessage.match(/[.!?…]$/)) {
        finalMessage += '...';
      }
      
      // Se houver link relevante, inclua de forma natural
      if (mainLink && !finalMessage.includes(mainLink)) {
          finalMessage += `\n\nSaiba mais: ${mainLink}`;
      }

      const finalResponse = { responseMsg: finalMessage, data };
      const executionTimeMs = Date.now() - start;

      await this.logger.log('knowledge-agent', {
        question, 
        ...finalResponse,
        sources: limitedContext.map(a => a.url),
        executionTimeMs,
        usedEmbeddings: true,
      });

      return finalResponse;
      
    } catch (error) {
      console.error('Error in KnowledgeAgent answer:', error);
      const executionTimeMs = Date.now() - start;
      
      await this.logger.log('knowledge-agent', {
        question, 
        error: error.message,
        executionTimeMs,
        usedEmbeddings: false,
      });

      return { 
        responseMsg: 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.', 
        data: {} 
      };
    }
  }
}