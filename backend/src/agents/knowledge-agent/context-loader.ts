import * as cheerio from 'cheerio';
import { RedisCacheService } from '../../redis/redis-cache/redis-cache.service';
import { ArticleContext } from './types';

// Simple in-memory cache
let redisCacheService: RedisCacheService | null = null;

export function setRedisCacheService(service: RedisCacheService) {
    redisCacheService = service;
}

// 🎯 OTIMIZAÇÃO: Mapeamento inteligente de palavras-chave para coleções
function getRelevantCollections(question: string): number[] {
    // Se question está vazia, retorna coleções principais
    if (!question || question.trim() === '') {
        console.log('🔍 No specific question provided, using main collections');
        return [7, 1, 3]; // Coleções mais importantes
    }

    const questionLower = question.toLowerCase();
    const collectionMap: Record<string, number[]> = {
        // Coleção 7: Sua Maquininha (mais frequente)
        'maquininha|taxa|cobrança|custo|preço|valor': [7],
        // Coleção 1: Conta digital  
        'conta|saldo|pix|transferencia|cartão': [1, 7],
        // Coleção 3: Suporte
        'ajuda|suporte|contato|problema|erro': [3, 7],
        // Fallback: Coleções mais importantes
        'default': [7, 1, 3] // As 3 mais relevantes
    };

    for (const [keywords, collections] of Object.entries(collectionMap)) {
        if (keywords === 'default') continue;
        const regex = new RegExp(keywords, 'i');
        if (regex.test(questionLower)) {
            console.log(`🎯 Question "${question}" matched pattern "${keywords}" → collections ${collections.join(', ')}`);
            return collections;
        }
    }
    
    console.log(`🔍 Question "${question}" didn't match any pattern → using default collections`);
    return collectionMap.default;
}

// 🚀 OTIMIZAÇÃO: Processamento de uma coleção específica
async function processCollection(collectionUrl: string, collectionIndex: number): Promise<ArticleContext[]> {
    try {
        let articles: string[] = [];
        const collectionCacheKey = `collection:${collectionUrl}`;
        
        if (redisCacheService) {
            const cachedArticles = await redisCacheService.getCache(collectionCacheKey);
            if (cachedArticles) {
                console.log(`✅ Collection ${collectionIndex} cache hit`);
                articles = cachedArticles;
            }
        }
        
        if (!articles.length) {
            console.log(`⚡ Fetching collection ${collectionIndex} from web...`);
            const r = await fetch(collectionUrl);
            const h = await r.text();
            const $$ = cheerio.load(h);
            articles = [];

            // Select article links within the collection
            $$('a[href*="/articles/"]').each((_, el) => {
                const href = $$(el).attr('href');
                if (href && href.includes('/pt-BR/articles/')) {
                    const fullUrl = href.startsWith('https://') ? href : `https://ajuda.infinitepay.io${href}`;
                    articles.push(fullUrl);
                }
            });

            if (redisCacheService && articles.length) {
                await redisCacheService.setCache(collectionCacheKey, articles);
            }
        }

        console.log(`📄 Collection ${collectionIndex} has ${articles.length} articles`);

        // 🔒 TEMPORÁRIO: Processa apenas os primeiros 30 artigos para ser mais rápido
        // const TEMP_MAX_ARTICLES_PER_COLLECTION = 30; // TODO: Remover limitação após validação 
        // const articlesToProcess = articles.slice(0, TEMP_MAX_ARTICLES_PER_COLLECTION);
        // console.log(`🚀 Processing first ${articlesToProcess.length} articles for speed...`);

        const articlesToProcess = articles;
        console.log(`🚀 Processing all ${articlesToProcess.length} articles!`);

        // Process articles in parallel (maximum 3 simultaneous)
        const contexts: ArticleContext[] = [];
        const batchSize = 3;
        
        for (let i = 0; i < articlesToProcess.length; i += batchSize) {
            const batch = articlesToProcess.slice(i, i + batchSize);
            
            const batchPromises = batch.map(async (link) => {
                const articleCacheKey = `article:${link}`;
                
                if (redisCacheService) {
                    const cachedArticle = await redisCacheService.getCache(articleCacheKey);
                    if (cachedArticle) {
                        console.log(`✅ Article cache hit: ${cachedArticle.title.substring(0, 40)}...`);
                        return cachedArticle;
                    }
                }

                try {
                    console.log(`🌐 Fetching article: ${link.split('/articles/')[1]?.substring(0, 30)}...`);
                    const ar = await fetch(link);
                    const ah = await ar.text();
                    const $$$ = cheerio.load(ah);
                    const text = $$$('.article').text().trim();
                    const title = $$$('h1').first().text().trim() || link;
                    
                    const articleObj: ArticleContext = { title, url: link, text };
                    
                    if (redisCacheService && articleObj.text) {
                        await redisCacheService.setCache(articleCacheKey, articleObj);
                    }
                    
                    console.log(`✅ Processed: ${title.substring(0, 40)}...`);
                    return articleObj;
                } catch (error) {
                    console.error(`❌ Error fetching article ${link}:`, error.message);
                    return null;
                }
            });

            const batchResults = await Promise.all(batchPromises);
            contexts.push(...batchResults.filter(article => article && article.text));
        }

        console.log(`🎉 Collection ${collectionIndex} processed ${contexts.length} articles successfully`);
        return contexts;

    } catch (error) {
        console.error(`💥 Error processing collection ${collectionIndex}:`, error);
        return [];
    }
}

export async function loadDynamicContext(question: string): Promise<ArticleContext[]> {
    // 🔒 TEMPORÁRIO: Sistema de segurança - processa apenas 1 coleção
    const TEMP_SINGLE_COLLECTION_MODE = true; // TODO: Alterar para false após validação ✅ ATIVADO!
    const TEMP_TARGET_COLLECTION = 1;
    // const TEMP_TARGET_COLLECTION = 7; // Sua Maquininha (mais relevante) 

    const baseUrl = 'https://ajuda.infinitepay.io/pt-BR/';
    const cacheKey = `collections:${baseUrl}`;
    
    // Check if we already have processed articles in direct cache
    const quickCacheKey = 'processed_articles:quick';
    if (redisCacheService) {
        const quickCache = await redisCacheService.getCache(quickCacheKey);

        if (question && quickCache && quickCache.length > 0) {
            console.log('📚 Using quick cache with', quickCache.length, 'articles'); 
            return quickCache.slice(0, 10); // Retorna apenas 10 artigos mais relevantes 
        }
    }

    let html: string | null = null;
    if (redisCacheService) {
        html = await redisCacheService.getCache(cacheKey);
    }
    if (!html) {
        const res = await fetch(baseUrl);
        html = await res.text();
        if (redisCacheService) {
            await redisCacheService.setCache(cacheKey, html);
        }
    }
    const $aux = cheerio.load(html);
    console.log('loadDynamicContext: dynamic context from:', {baseUrl});

    // --------------------------------------------
    const section = $aux('main > div > section').html() || '';
    const $ = cheerio.load(section);

    // Select all article collection links
    const collectionLinks: string[] = [];
    $('a[href*="/collections/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && href.startsWith('/pt-BR/collections/')) {
            collectionLinks.push(`https://ajuda.infinitepay.io${href}`);
        }
        else if (href && href.includes('/pt-BR/collections/')) {
            collectionLinks.push(href);
        }
    });

    console.log({ collectionLinksQtd: collectionLinks.length });

    let targetCollections: number[];
    
    if (TEMP_SINGLE_COLLECTION_MODE) {
        // 🔒 MODO TEMPORÁRIO: Processa apenas 1 coleção específica
        targetCollections = [TEMP_TARGET_COLLECTION];
        console.log(`🔒 TEMP MODE: Processing only collection ${TEMP_TARGET_COLLECTION}`);
    }
    else if(!question) { // For embedding generation mode
        // fill from 1 to 15
        targetCollections = Array.from({ length: 15 }, (_, i) => i + 1);
    }
    else {
        // 🚀 MODO COMPLETO: Busca inteligente baseada na pergunta
        targetCollections = getRelevantCollections(question);
        console.log(`🎯 Smart search targeting collections: ${targetCollections.join(', ')}`);
    }

    // Search articles from target collections
    const contexts: ArticleContext[] = [];
    
    for (const collectionIndex of targetCollections) {
        const targetUrl = collectionLinks[collectionIndex - 1]; // Array começa em 0

        if (!targetUrl) {
            console.log(`❌ Collection ${collectionIndex} not found`);
            continue;
        }
        
        console.log(`\n🎯 Processing collection ${collectionIndex}: ${targetUrl.split('/collections')[1]}`);
        
        const collectionContexts = await processCollection(targetUrl, collectionIndex);
        contexts.push(...collectionContexts);
        
        // Em modo temporário, para após processar a primeira coleção
        if (TEMP_SINGLE_COLLECTION_MODE) break;
    }

    // Fast cache for next queries
    if (redisCacheService && contexts.length > 0) {
        await redisCacheService.setCache(quickCacheKey, contexts, 3600); // 1 hora 
    }

    console.log(`🎉 Successfully processed ${contexts.length} articles total`);
    return contexts;
}
