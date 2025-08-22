import { Injectable } from '@nestjs/common';
import { HfInference } from '@huggingface/inference';
import { RedisCacheService } from '../../redis/redis-cache/redis-cache.service';
import { ArticleContext } from './context-loader';

export interface ArticleWithEmbedding extends ArticleContext {
    embedding: number[];
}

@Injectable()
export class EmbeddingService {
    private hf: HfInference;

    constructor(private readonly redisCache: RedisCacheService) {
        // Usar token do Hugging Face se disponível (pode ser variável de ambiente)
        this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
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
            // Gera embedding da pergunta
            const questionEmbedding = await this.generateEmbedding(question);

            // Busca todos os embeddings do Redis usando o padrão do cache
            const keys = await this.redisCache.getKeysPattern('cache:embedding:*');
            const articles: Array<{ article: ArticleWithEmbedding; similarity: number }> = [];

            for (const key of keys) {
                // Remove o prefixo 'cache:' para usar o método getCache
                const cacheKey = key.replace('cache:', '');
                const articleWithEmbedding: ArticleWithEmbedding = await this.redisCache.getCache(cacheKey);
                if (!articleWithEmbedding || !articleWithEmbedding.embedding) continue;

                // Calcula similaridade coseno
                const similarity = this.cosineSimilarity(questionEmbedding, articleWithEmbedding.embedding);
                articles.push({ article: articleWithEmbedding, similarity });
            }

            // Ordena por similaridade e retorna os mais relevantes
            return articles
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit)
                .map(item => ({
                    title: item.article.title,
                    url: item.article.url,
                    text: item.article.text,
                }));
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
}
