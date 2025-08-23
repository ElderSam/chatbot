import { Injectable } from '@nestjs/common';
import { InferenceClient } from '@huggingface/inference';
import { RedisCacheService } from '../../redis/redis-cache/redis-cache.service';
import { ArticleContext, ArticleWithEmbedding } from './types';@Injectable()
export class EmbeddingService {
    private hf: InferenceClient;

    constructor(private readonly redisCache: RedisCacheService) {
        // Usar token do Hugging Face se disponível (pode ser variável de ambiente)
        this.hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
    }

    async generateEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.hf.featureExtraction({
                model: 'sentence-transformers/all-MiniLM-L6-v2',
                inputs: text,
            });

            // Normalizar o embedding se for array de arrays
            const embedding = Array.isArray(response[0]) ? response[0] : response;
            return embedding as number[];
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw error;
        }
    }

    async storeArticleEmbeddings(articles: ArticleContext[]): Promise<void> {
        for (const article of articles) {
            const embeddingKey = `embedding:${article.url}`;

            // Verifica se já existe no cache
            const cached = await this.redisCache.getCache(embeddingKey);
            if (cached) continue;

            try {
                // Gera embedding do título + texto do artigo
                const textToEmbed = `${article.title} ${article.text}`.substring(0, 1000);
                const embedding = await this.generateEmbedding(textToEmbed);

                const articleWithEmbedding: ArticleWithEmbedding = {
                    ...article,
                    embedding,
                };

                await this.redisCache.setCache(embeddingKey, articleWithEmbedding);
                console.log(`Stored embedding for: ${article.title}`);
            } catch (error) {
                console.error(`Error processing article ${article.url}:`, error);
            }
        }
    }

    async findMostRelevantArticles(question: string, limit: number = 3): Promise<ArticleContext[]> {
        try {
            // 🚀 OTIMIZAÇÃO: Cache de busca por pergunta similar
            const questionHash = this.hashQuestion(question);
            const searchCacheKey = `search_cache:${questionHash}`;
            
            const cachedResult = await this.redisCache.getCache(searchCacheKey);
            if (cachedResult) {
                console.log('🚀 Search cache hit!');
                return cachedResult;
            }

            // Gera embedding da pergunta
            const questionEmbedding = await this.generateEmbedding(question);

            // 🔒 TEMPORÁRIO: Busca apenas em embeddings "ativos" (otimização para testes)
            const TEMP_BATCH_MODE = false; // TODO: Alterar para false após validação?
            const activeKeys = await this.getActiveEmbeddingKeys();
            const articles: Array<{ article: ArticleWithEmbedding; similarity: number }> = [];

            if (TEMP_BATCH_MODE) {
                // Processamento em lotes para evitar sobrecarga
                const batchSize = 50;
                console.log(`🔄 Processing ${activeKeys.length} embeddings in batches of ${batchSize}`);
                
                for (let i = 0; i < activeKeys.length; i += batchSize) {
                    const batch = activeKeys.slice(i, i + batchSize);
                    const batchPromises = batch.map(async (key) => {
                        const cacheKey = key.replace('cache:', '');
                        const articleWithEmbedding: ArticleWithEmbedding = await this.redisCache.getCache(cacheKey);
                        if (!articleWithEmbedding?.embedding) return null;

                        const similarity = this.cosineSimilarity(questionEmbedding, articleWithEmbedding.embedding);
                        
                        // 🎯 OTIMIZAÇÃO: Filtro de relevância mínima (economiza processamento)
                        if (similarity < 0.3) return null; // Ignora artigos pouco relevantes
                        
                        return { article: articleWithEmbedding, similarity };
                    });

                    const batchResults = await Promise.all(batchPromises);
                    articles.push(...batchResults.filter(item => item !== null));
                }
            } else {
                // Processamento normal para todos os embeddings
                for (const key of activeKeys) {
                    const cacheKey = key.replace('cache:', '');
                    const articleWithEmbedding: ArticleWithEmbedding = await this.redisCache.getCache(cacheKey);
                    if (!articleWithEmbedding || !articleWithEmbedding.embedding) continue;

                    const similarity = this.cosineSimilarity(questionEmbedding, articleWithEmbedding.embedding);
                    articles.push({ article: articleWithEmbedding, similarity });
                }
            }

            // Ordena por similaridade e retorna os mais relevantes
            const results = articles
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit)
                .map(item => ({
                    title: item.article.title,
                    url: item.article.url,
                    text: this.compressText(item.article.text, 400), // 🎯 OTIMIZAÇÃO: Comprime texto
                }));

            // Cache do resultado da busca por 1 hora
            if (results.length > 0) {
                await this.redisCache.setCache(searchCacheKey, results, 3600);
            }

            console.log(`🎯 Found ${results.length} relevant articles (from ${articles.length} candidates)`);
            return results;
        } catch (error) {
            console.error('Error finding relevant articles:', error);
            return [];
        }
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }

    // 🚀 OTIMIZAÇÃO: Hash simples baseado em palavras-chave principais
    private hashQuestion(question: string): string {
        return question
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(' ')
            .filter(word => word.length > 3)
            .sort()
            .join('_')
            .substring(0, 50);
    }

    // 🎯 OTIMIZAÇÃO: Busca chaves ativas de embedding (pode ser melhorado com scoring)
    private async getActiveEmbeddingKeys(): Promise<string[]> {
        // Por enquanto retorna todas, mas pode ser otimizado com:
        // - Frequência de acesso
        // - Data de criação
        // - Relevância histórica
        return await this.redisCache.getKeysPattern('cache:embedding:*');
    }

    // 💰 OTIMIZAÇÃO: Compressão inteligente de texto para economizar tokens
    private compressText(text: string, maxChars: number): string {
        if (text.length <= maxChars) return text;

        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        
        // Prioriza frases com palavras-chave importantes
        const importantKeywords = ['taxa', 'custo', 'valor', 'preço', 'cobrança', 'grátis', 'pagar', 'maquininha'];
        
        const scoredSentences = sentences.map(sentence => {
            const score = importantKeywords.reduce((acc, keyword) => {
                return acc + (sentence.toLowerCase().includes(keyword) ? 1 : 0);
            }, 0);
            return { sentence: sentence.trim(), score };
        });
        
        // Ordena por relevância e concatena até o limite
        let result = '';
        const sortedSentences = scoredSentences.sort((a, b) => b.score - a.score);
        
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
