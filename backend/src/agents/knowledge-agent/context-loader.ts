// Usando fetch nativo do Node.js >=18
import * as cheerio from 'cheerio';

export interface ArticleContext {
    title: string;
    url: string;
    text: string;
}

export async function loadDynamicContext(question: string): Promise<ArticleContext[]> {
    const baseUrl = 'https://ajuda.infinitepay.io/pt-BR/';
    const res = await fetch(baseUrl);
    const html = await res.text();
    const $aux = cheerio.load(html);

    console.log('loadDynamicContext: dynamic context from:', {baseUrl});
    console.log('Base page status:', res.status);

    // --------------------------------------------
    const section = $aux('main > div > section').html() || '';
    const $ = cheerio.load(section);

    // Seleciona todos os links de coleções de artigos
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

    console.log({ collectionLinksQtd: collectionLinks.length })

    // Busca artigos e filtra por relevância
    const contexts: ArticleContext[] = [];
    const priority: ArticleContext[] = [];
    for (const collectionUrl of collectionLinks) {
        try {
            const r = await fetch(collectionUrl);
            const h = await r.text();
            const $$ = cheerio.load(h);

            console.log('Collection page status:', collectionUrl, r.status);

            // Seleciona os links dos artigos dentro da coleção
            const articles: string[] = [];

            $$('.article-list a').each((_, el) => {
                const href = $$(el).attr('href');
                if (href) articles.push(`https://ajuda.infinitepay.io${href}`);
            });

            if (!articles.length) {
                $$('body main > div > section section a').each((_, el) => {
                    const href = $$(el).attr('href');
                    const dataTestId = $$(el).attr('data-testid');
                    // Adiciona apenas se data-testid NÃO for 'article-link'
                    if (href && dataTestId == 'article-link') {
                        articles.push(href);
                        // articles.push(`https://ajuda.infinitepay.io${href}`);
                    }
                });
            }

            console.log({ articlesQt: articles.length })

            // Busca o conteúdo de cada artigo
            for (const link of articles) {
                try {
                    const ar = await fetch(link);
                    console.log('Article page status:', link, ar.status);

                    const ah = await ar.text();
                    const $$$ = cheerio.load(ah);
                    const text = $$$('.article').text();
                    const title = $$$('h1').first().text().trim() || link;

                    console.log('Article processed:', { title, url: link, textLength: text.length });

                    // Filtra por relevância usando palavras da pergunta
                    if (text && question) {
                        const qWords = question.toLowerCase().split(/\W+/).filter(w => w.length > 2);
                        const foundInText = qWords.some(w => text.toLowerCase().includes(w));
                        const foundInTitle = qWords.some(w => title.toLowerCase().includes(w));
                        const articleObj = { title, url: link, text };
                        if (foundInTitle || foundInText) {
                            priority.push(articleObj);
                        } else {
                            contexts.push(articleObj);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching article:', link, err);
                }
            }
        } catch (err) {
            console.error('Error fetching collection:', collectionUrl, err);
        }
    }

    console.log({ priorities: priority.length, contexts: contexts.length });

    // Prioriza artigos relevantes, depois completa com outros até o limite
    let total = 0;
    const limited: ArticleContext[] = [];
    for (const ctx of priority.concat(contexts)) {
        if (total + ctx.text.length > 12000) break;
        limited.push(ctx);
        total += ctx.text.length;
    }
    console.log({ total })
    console.log({ limited })
    return limited;
}
