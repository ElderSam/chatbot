export interface ArticleContext {
    title: string;
    url: string;
    text: string;
}

export interface ArticleWithEmbedding extends ArticleContext {
    embedding: number[];
}
