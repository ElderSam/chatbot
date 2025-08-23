import { Injectable } from '@nestjs/common';
import { GroqService } from '../groq/groq.service';
import { loadDynamicContext, setRedisCacheService } from './context-loader';
import { EmbeddingService } from './embedding.service';
import { RedisLoggerService } from '../../redis/redis-logger/redis-logger.service';
import { RedisCacheService } from '../../redis/redis-cache/redis-cache.service';
import { ArticleContext } from './types';
import { MAX_ARTICLES_FOR_CONTEXT, SAFETY_MODE, MAX_ARTICLES_SAFETY_MODE } from './constants';

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
      // Maximum number of articles to use for context
      const maxArticles = SAFETY_MODE ? MAX_ARTICLES_SAFETY_MODE : MAX_ARTICLES_FOR_CONTEXT;

      // First, try to find relevant articles using semantic embeddings
      let limitedContext = await this.embeddingService.findMostRelevantArticles(question, maxArticles);

      // If no relevant articles found or few embeddings, load context dynamically
      if (limitedContext.length === 0) {
        console.log('No relevant articles found with embeddings, loading dynamic context...');
        const dynamicArticles = await loadDynamicContext(question);

        // Generate embeddings for new articles and save them in Redis
        if (dynamicArticles.length > 0) {
          await this.embeddingService.storeArticleEmbeddings(dynamicArticles);
          // Try similarity search again
          limitedContext = await this.embeddingService.findMostRelevantArticles(question, maxArticles);

          // If still not found, use dynamically loaded articles as fallback
          if (limitedContext.length === 0) {
            limitedContext = dynamicArticles.slice(0, maxArticles);
          }
        }
      }

      // If specific context provided, use it
      if (context && context.length > 0) {
        limitedContext = context.slice(0, maxArticles);
        console.log({ contextLen: context.length, limitedContextLen: limitedContext.length });
      }

      console.log(`Using ${limitedContext.length} articles for context`);

      if (limitedContext.length === 0) {
        console.warn('KnowledgeAgentService - No context available');
        return { responseMsg: 'Desculpe, não encontrei informações relevantes sobre sua pergunta no momento. Por favor, consulte o site da InfinitePay para mais detalhes.', data: {} };
      }

      // 💰 OPTIMIZATION: Smart context compression to save tokens
      // TEMPORARY: Disable compression for testing - send full articles
      const contextText = limitedContext.map((article, i) => {
        return `${i + 1}. ${article.title}\n${article.text}\nURL: ${article.url}\n`;
      }).join('\n');
      // const contextText = this.compressContext(limitedContext);

      const mainLink = limitedContext[0].url;

      // English prompt for better model performance
      const prompt = `Answer the question directly based only on the provided information.

        QUESTION: ${question}

        INFORMATION:
        ${contextText}

        INSTRUCTIONS:
        - Be direct and concise
        - Include only essential information to answer the question
        - If there's a specific contact (email, phone), include it COMPLETE
        - Maximum 2-3 sentences

        ANSWER:`
      ;

      console.log('KnowledgeAgentService - generating answer with LLM');

      // Calls LLM to generate answer
      const { responseMsg, data } = await this.groq.chatCompletion({ 
        prompt,
        model: 'llama-3.1-8b-instant',
        temperature: 0.05, // Very low for deterministic responses
        max_tokens: 512    // Sufficient but not excessive
      });

      console.log({ responseMsg: responseMsg?.substring(0, 100), mainLink });

      let finalMessage = responseMsg?.trim() || 'Consulte o site da InfinitePay para mais detalhes.';

      // Check if the answer seems cut off and add ellipsis
      if (finalMessage && !finalMessage.match(/[.!?…]$/)) {
        finalMessage += '...';
      }

      // If there is a relevant link, include it naturally
      // if (mainLink && !finalMessage.includes(mainLink)) {
      //   finalMessage += `\n\nSaiba mais: ${mainLink}`;
      // }

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

  // 💰 OPTIMIZATION: Smart context compression to save tokens
  private compressContext(articles: ArticleContext[]): string {
    return articles.map((article, i) => {
      // Use more text per article to avoid missing important information
      const relevantText = this.extractRelevantSentences(article.text, 800); // Increased from 300 to 800
      return `${i + 1}. ${article.title}\n${relevantText}\nURL: ${article.url}\n`;
    }).join('\n');
  }

  // 🎯 OPTIMIZATION: Extracts most relevant sentences based on keywords + position
  private extractRelevantSentences(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Always prioritize first sentences (they often contain the main answer)
    const firstSentences = sentences.slice(0, 2); // First 2 sentences always included
    
    // Then add sentences with important keywords
    const importantKeywords = ['taxa', 'custo', 'valor', 'preço', 'cobrança', 'grátis', 'pagar', 'maquininha', 'InfinitePay', 'horário', 'funcionamento', 'atendimento'];

    const scoredSentences = sentences.map((sentence, index) => {
      let score = 0;
      
      // Bonus for being at the beginning of the text
      if (index < 3) score += 2;
      
      // Bonus for containing keywords
      score += importantKeywords.reduce((acc, keyword) => {
        return acc + (sentence.toLowerCase().includes(keyword) ? 1 : 0);
      }, 0);
      
      return { sentence: sentence.trim(), score, index };
    });

    // Sort by relevance (score first, then by position)
    let result = '';
    const sortedSentences = scoredSentences.sort((a, b) => b.score - a.score || a.index - b.index);

    for (const item of sortedSentences) {
      if (result.length + item.sentence.length <= maxChars) {
        result += item.sentence + '. ';
      } else {
        break;
      }
    }

    return result || text.substring(0, maxChars) + '...';
  }
}