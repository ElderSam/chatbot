// Usando fetch nativo do Node.js >=18
import * as cheerio from 'cheerio';

export interface ArticleContext {
    title: string;
    url: string;
    text: string;
}

// Cache simples em memória
const articleCache = new Map<string, ArticleContext>();
const collectionCache = new Map<string, string[]>();

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

    // Palavras-chave genéricas para fallback
    const fallbackKeywords = ['pagamento', 'cartão', 'receber', 'transação', 'venda', 'máquina', 'infinitepay', 'dinheiro', 'saldo', 'transferência'];

    // Busca artigos e filtra por relevância
    const contexts: ArticleContext[] = [];
    const priority: ArticleContext[] = [];
    let collectionNum = 0;

    for (const collectionUrl of collectionLinks) {
        collectionNum++;
        try {
            let articles: string[];

            if (collectionCache.has(collectionUrl)) {
                articles = collectionCache.get(collectionUrl)!;
            }
            else {
                const r = await fetch(collectionUrl);
                const h = await r.text();
                const $$ = cheerio.load(h);
                articles = [];

                console.log('Collection page status:', collectionUrl, r.status);
    
                // Seleciona os links dos artigos dentro da coleção
                // TODO. ver se precisa disso, já que nunca entra aqui, mas sim na condição abaixo
                $$('.article-list a').each((i, el) => {
                    // TODO. verificar se pode ficar assim.
                    if (i >= 5) return false; // Limita a 5 artigos por coleção
    
                    const href = $$(el).attr('href');
                    if (href) articles.push(`https://ajuda.infinitepay.io${href}`);
                });

                if (!articles.length) {
                    $$('body main > div > section section a').each((_, el) => {
                        const href = $$(el).attr('href');
                        const dataTestId = $$(el).attr('data-testid');
                        // Adiciona apenas se data-testid NÃO for 'article-link'
                        if (href && dataTestId == 'article-link') { // remove os principais links, que vão repetir os links internos
                            articles.push(href);
                            // articles.push(`https://ajuda.infinitepay.io${href}`);
                        }
                    });
                }

                collectionCache.set(collectionUrl, articles);
            }


            console.log({ articlesQt: articles.length })

            const collectionName = collectionUrl.split('/collections')[1];
            console.log({ collectionNum, collectionName })

            // TODO. teste temporário para impedir de ler muitos artigos.
            if(collectionNum!== 2) {
                while(articles.length) {
                    articles.pop()
                }
            }
            else {
                console.log('só vai buscar o conteúdo dos artigos da 2a coleção')
            }

            // Busca o conteúdo de cada artigo
            for (const link of articles) {
                let articleObj: ArticleContext;
                try {
                    if (articleCache.has(link)) {
                        articleObj = articleCache.get(link)!;
                    }
                    else {
                        const ar = await fetch(link);
                        console.log('Article page status:', link, ar.status);
    
                        const ah = await ar.text();
                        const $$$ = cheerio.load(ah);
                        const text = $$$('.article').text();
                        const title = $$$('h1').first().text().trim() || link;
    
                        console.log('Article processed:', { title, url: link, textLength: text.length });

                        articleObj = { title, url: link, text };
                        articleCache.set(link, articleObj);
                    }

                    // Filtra por relevância usando palavras da pergunta
                    const { text, title } = articleObj;
                    if (text && question) {
                        const qWords = question.toLowerCase().split(/\W+/).filter(w => w.length > 2);
                        const foundInText = qWords.some(w => text.toLowerCase().includes(w));
                        const foundInTitle = qWords.some(w => title.toLowerCase().includes(w));
                        // const articleObj = { title, url: link, text };
                        if (foundInTitle || foundInText) {
                            priority.push(articleObj);
                        }
                        else {
                            // TODO. ver se é necessário
                            // Fallback: verifica palavras-chave genéricas
                            const foundFallback = fallbackKeywords.some(w => text.toLowerCase().includes(w) || title.toLowerCase().includes(w));
                            if (foundFallback) {
                                contexts.push(articleObj);
                            }
                            // contexts.push(articleObj);
                        }
                    } 
                    else {
                        console.log('Artigo não relevante:', { title, url: link });
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


    // TODO. ver se é necessário
    // Se não encontrou nada relevante, retorna os primeiros artigos da coleção como fallback
    if (priority.length === 0 && contexts.length === 0) {
        console.log('Nenhum artigo relevante encontrado, usando fallback dos primeiros artigos.');
        for (const collectionUrl of collectionLinks) {
            try {
                const r = await fetch(collectionUrl);
                const h = await r.text();
                const $$ = cheerio.load(h);
                $$('.article-list a').each((_, el) => {
                    const href = $$(el).attr('href');
                    if (href) {
                        const link = `https://ajuda.infinitepay.io${href}`;
                        contexts.push({ title: link, url: link, text: '' });
                    }
                });
            } catch(error) {
                console.error('Error fetching collection:', collectionUrl, error);
            }
        }
    }

    // Prioriza artigos relevantes, depois completa com outros até o limite
    let total = 0;
    const limited: ArticleContext[] = [];
    for (const ctx of priority.concat(contexts)) {
        if (total + ctx.text.length > 12000) break;
        limited.push(ctx);
        total += ctx.text.length;
    }

    console.log({ total })
    console.log({ limitedTitles: limited.map(c => c.title) })

    return limited;
}
