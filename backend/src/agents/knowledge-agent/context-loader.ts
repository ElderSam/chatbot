import * as cheerio from 'cheerio';
import { RedisCacheService } from '../../redis/redis-cache/redis-cache.service';
import { ArticleContext } from './types';

// Simple in-memory cache
let redisCacheService: RedisCacheService | null = null;

export function setRedisCacheService(service: RedisCacheService) {
    redisCacheService = service;
}

export async function loadDynamicContext(question: string): Promise<ArticleContext[]> {

    const baseUrl = 'https://ajuda.infinitepay.io/pt-BR/';
    const cacheKey = `collections:${baseUrl}`;
    
    // Check if we already have processed articles in direct cache
    const quickCacheKey = 'processed_articles:quick';
    if (redisCacheService) {
        const quickCache = await redisCacheService.getCache(quickCacheKey);
        if (quickCache && quickCache.length > 0) {
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

    // OTIMIZAÇÃO: Processa apenas coleção 7 que é a mais relevante
    const targetCollection = 7; // Sua Maquininha
    const targetUrl = collectionLinks[targetCollection - 1]; // Array começa em 0

    if (!targetUrl) {
        console.log('❌ Target collection not found');
        return [];
    }

    // Search articles only from target collection
    const contexts: ArticleContext[] = [];
    
    console.log(`🎯 Processing only collection ${targetCollection}: ${targetUrl.split('/collections')[1]}`);
    
    try {
        let articles: string[] = [];
        const collectionCacheKey = `collection:${targetUrl}`;
        
        if (redisCacheService) {
            const cachedArticles = await redisCacheService.getCache(collectionCacheKey);
            if (cachedArticles) {
                console.log('✅ Collection cache hit');
                articles = cachedArticles;
            }
        }
        
        if (!articles.length) {
            console.log('⚡ Fetching collection from web...');
            const r = await fetch(targetUrl);
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

        console.log(`📄 Found ${articles.length} articles`);

        // Processa apenas os primeiros 5 artigos para ser mais rápido
        const articlesToProcess = articles.slice(0, 5);
        console.log(`🚀 Processing first ${articlesToProcess.length} articles for speed...`);

        // Process articles in parallel (maximum 3 simultaneous)
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

        // Fast cache for next queries
        if (redisCacheService && contexts.length > 0) {
            await redisCacheService.setCache(quickCacheKey, contexts, 3600); // 1 hora 
        }

        console.log(`🎉 Successfully processed ${contexts.length} articles`);
        return contexts;

    } catch (error) {
        console.error('💥 Error processing collection:', error);
        return [];
    }
}
