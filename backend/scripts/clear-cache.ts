import Redis from 'ioredis';
import { readFileSync } from 'fs';
import { join } from 'path';

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

async function clearEmbeddingCache() {
    loadEnvFile();
    
    const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    });

    try {
        // Limpa um embedding específico para testar
        const keyToDelete = 'cache:embedding:https://ajuda.infinitepay.io/pt-BR/articles/3416086-como-posso-acompanhar-o-pedido-da-minha-maquina';
        
        console.log('🗑️ Deleting cache key:', keyToDelete);
        const result = await redis.del(keyToDelete);
        
        if (result === 1) {
            console.log('✅ Cache key deleted successfully');
        } else {
            console.log('⚠️ Cache key was not found or already deleted');
        }
        
        await redis.quit();
        console.log('🏁 Done!');
        
    } catch (error) {
        console.error('❌ Error:', error);
        await redis.quit();
    }
}

clearEmbeddingCache();
