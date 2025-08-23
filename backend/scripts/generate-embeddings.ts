import { InferenceClient } from '@huggingface/inference';
import Redis from 'ioredis';
import { readFileSync } from 'fs';
import { join } from 'path';
import { loadDynamicContext, setRedisCacheService } from '../src/agents/knowledge-agent/context-loader';
import { ArticleWithEmbedding } from '../src/agents/knowledge-agent/types';

// Carrega variáveis do .env manualmente
function loadEnvFile() {
    try {
        const envPath = join(__dirname, '../.env');
        const envFile = readFileSync(envPath, 'utf8');

        envFile.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=');
                    process.env[key] = value;
                }
            }
        });
    } catch (error) {
        console.warn('Could not load .env file:', error.message);
    }
}

// Cache service simplificado
class SimpleCacheService {
    private client: Redis;

    constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
        });
    }

    async getCache(key: string): Promise<any | null> {
        const val = await this.client.get(`cache:${key}`);
        return val ? JSON.parse(val) : null;
    }

    async setCache(key: string, value: any, ttlSec = 86400) {
        await this.client.set(`cache:${key}`, JSON.stringify(value), 'EX', ttlSec);
    }
}

async function generateEmbeddings() {
    // Carrega variáveis de ambiente do .env
    console.log('🔧 Loading environment variables...');
    loadEnvFile();

    console.log('🚀 Starting embeddings generation...');

    // Verifica se a API key está configurada
    if (!process.env.HUGGINGFACE_API_KEY) {
        console.error('❌ HUGGINGFACE_API_KEY not found in environment variables');
        console.log('Please check your .env file and make sure the API key is set');
        return;
    }

    console.log('✅ HuggingFace API key found');

    const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
    console.log('🤖 HuggingFace client initialized');

    const cacheService = new SimpleCacheService();
    console.log('📦 Cache service initialized');

    // Configura o cache service para o context loader
    setRedisCacheService(cacheService as any);
    console.log('🔗 Cache service configured for context loader');

    try {
        // Carrega artigos dinamicamente
        console.log('📚 Loading articles...');
        const startTime = Date.now();

        // OPÇÃO 1: Carrega todas as coleções sem filtro
        const articles = await loadDynamicContext('');
        
        // OPÇÃO 2: Pergunta específica para testar busca inteligente
        // const articles = await loadDynamicContext('taxa maquininha pagamento cartão');

        const loadTime = Date.now() - startTime;
        console.log(`⏱️ Articles loaded in ${loadTime}ms`);

        if (articles.length === 0) {
            console.log('❌ No articles found');
            return;
        }

        console.log(`📄 Found ${articles.length} articles total`);

        // Limita para apenas 30 artigos para teste mais rápido
        // const articlesToProcess = articles.slice(0, 30);
        // console.log(`🎯 Processing first ${articlesToProcess.length} articles for initial test...`);
        const articlesToProcess = articles;
        console.log(`🎯 Processing all ${articlesToProcess.length} articles! It can take a while⏳`);

        let processed = 0;
        let skipped = 0;
        let errors = 0;

        // Processa cada artigo com timeout de segurança
        for (let i = 0; i < articlesToProcess.length; i++) {
            const article = articlesToProcess[i];
            const embeddingKey = `embedding:${article.url}`;

            console.log(`\n[${i + 1}/${articlesToProcess.length}] 📖 Processing: ${article.title.substring(0, 60)}...`);
            console.log(`   URL: ${article.url}`);

            try {
                // Timeout de 30 segundos por operação
                const processWithTimeout = async () => {
                    // Verifica se já existe no cache
                    console.log('   🔍 Checking cache...');
                    const cached = await cacheService.getCache(embeddingKey);
                    if (cached) {
                        console.log('   ✅ Embedding already exists in cache, skipping...');
                        skipped++;
                        return;
                    }

                    // Gera embedding do título + texto do artigo (texto menor para ser mais rápido)
                    const textToEmbed = `${article.title} ${article.text}`.substring(0, 500);
                    console.log(`   📝 Text to embed (${textToEmbed.length} chars): ${textToEmbed.substring(0, 100)}...`);

                    console.log('   🌐 Calling Hugging Face API...');
                    const apiStartTime = Date.now();

                    const response = await hf.featureExtraction({
                        model: 'sentence-transformers/all-MiniLM-L6-v2',
                        inputs: textToEmbed,
                    });

                    const apiTime = Date.now() - apiStartTime;
                    console.log(`   ⚡ API response received in ${apiTime}ms`);

                    // Normalizar o embedding se for array de arrays
                    const embedding = Array.isArray(response[0]) ? response[0] : response;
                    console.log(`   🔢 Embedding vector length: ${embedding.length}`);

                    const articleWithEmbedding: ArticleWithEmbedding = {
                        ...article,
                        embedding: embedding as number[],
                    };

                    console.log('   💾 Storing in cache...');
                    await cacheService.setCache(embeddingKey, articleWithEmbedding);
                    console.log('   ✅ Embedding stored successfully!');
                    processed++;
                };

                // Aplica timeout
                await Promise.race([
                    processWithTimeout(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout after 30 seconds')), 30000)
                    )
                ]);

                // Pausa menor entre requisições
                console.log('   ⏸️ Waiting 500ms before next request...');
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                console.error(`   ❌ Error processing article: ${error.message}`);
                errors++;
            }
        }

        console.log('\n🎉 Embeddings generation completed!');
        console.log(`📊 Summary: ${processed} processed, ${skipped} skipped, ${errors} errors`);
        console.log('✅ You can now test the semantic search in your KnowledgeAgent');

    } catch (error) {
        console.error('💥 Critical error in embeddings generation:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        console.log('🔚 Script finished, exiting...');
        process.exit(0);
    }
}

// Executa o script
generateEmbeddings();
