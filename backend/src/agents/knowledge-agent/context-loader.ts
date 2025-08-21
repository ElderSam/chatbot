// Usando fetch nativo do Node.js >=18
import * as cheerio from 'cheerio';

export async function loadDynamicContext(question: string): Promise<string[]> {
    const baseUrl = 'https://ajuda.infinitepay.io/pt-BR/';
    const res = await fetch(baseUrl);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Seleciona todos os links de coleções de artigos
    const collectionLinks: string[] = [];
    $('a[href*="/collections/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && href.startsWith('/pt-BR/collections/')) {
            collectionLinks.push(`https://ajuda.infinitepay.io${href}`);
        }
    });

    // Busca artigos e filtra por relevância
    const contexts: string[] = [];
    for (const collectionUrl of collectionLinks) {
        try {
            const r = await fetch(collectionUrl);
            const h = await r.text();
            const $$ = cheerio.load(h);
            // Seleciona os links dos artigos dentro da coleção
            const articles: string[] = [];
            $$('.article-list a').each((_, el) => {
                const href = $$(el).attr('href');
                if (href) articles.push(`https://ajuda.infinitepay.io${href}`);
            });
            // Busca o conteúdo de cada artigo
            for (const link of articles) {
                try {
                    const ar = await fetch(link);
                    const ah = await ar.text();
                    const $$$ = cheerio.load(ah);
                    const text = $$$('.article-body').text();
                    // Filtra por relevância usando palavras da pergunta
                    if (text && question) {
                        const qWords = question.toLowerCase().split(/\W+/).filter(w => w.length > 2);
                        const found = qWords.some(w => text.toLowerCase().includes(w));
                        if (found) contexts.push(text);
                    }
                } catch {}
            }
        } catch {}
    }
    // Limita o tamanho total do contexto (ex: 12000 caracteres)
    let total = 0;
    const limited: string[] = [];
    for (const ctx of contexts) {
        if (total + ctx.length > 12000) break;
        limited.push(ctx);
        total += ctx.length;
    }
    return limited;
}
