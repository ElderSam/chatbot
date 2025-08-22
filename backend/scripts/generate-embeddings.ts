import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { EmbeddingService } from '../src/agents/knowledge-agent/embedding.service';
import { loadDynamicContext } from '../src/agents/knowledge-agent/context-loader';
import { RedisCacheService } from '../src/redis/redis-cache/redis-cache.service';

async function generateEmbeddings() {
    console.log('Starting embeddings generation...');

    const app = await NestFactory.createApplicationContext(AppModule);
    const embeddingService = app.get(EmbeddingService);
    const redisCacheService = app.get(RedisCacheService);

    try {
        // Carrega artigos dinamicamente (como antes)
        console.log('Loading articles...');
        const articles = await loadDynamicContext('taxa maquininha pagamento cartão');

        if (articles.length === 0) {
            console.log('No articles found');
            return;
        }

        console.log(`Found ${articles.length} articles, generating embeddings...`);

        // Gera e armazena embeddings usando Hugging Face API
        await embeddingService.storeArticleEmbeddings(articles);

        console.log('✅ Embeddings generated and stored successfully!');
        console.log('You can now test the semantic search in your KnowledgeAgent');

    } catch (error) {
        console.error('❌ Error generating embeddings:', error);
    } finally {
        await app.close();
    }
}

// Executa o script
generateEmbeddings();
