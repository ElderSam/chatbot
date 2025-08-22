import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatCompletionResponse } from './groq.types';

@Injectable()
export class GroqService {
    private groqKey?: string;

    constructor(cfg: ConfigService) {
        this.groqKey = cfg.get<string>('GROQ_API_KEY') || undefined;
    }

    async chatCompletion({ prompt, model = 'llama-3.1-8b-instant', temperature = 0, max_tokens = 24 }): Promise<ChatCompletionResponse> {
        if (!this.groqKey) throw new Error('GROQ_API_KEY not set');

        console.log('chatCompletion:')
        console.log({prompt})

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.groqKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: prompt }],
                temperature,
                max_tokens,
            }),
        });

        const raw: any = await res.json();

        const usagePercent = ((raw.usage?.completion_tokens * 100) / (raw.usage?.total_tokens || 1)).toFixed(2) + '%';
        const remainingTokens = raw.usage?.prompt_tokens;

        console.log(raw.usage)
        console.log(`Groq usage: ${usagePercent}. Tokens remaining: ${remainingTokens}`);

        const responseMessage = raw?.choices?.[0]?.message;

        // Filtra apenas os campos relevantes
        const data = {
            llm_api: 'groq',
            object: raw.object,
            model: raw.model,
            responseMessage,
            usage: { usagePercent, remainingTokens },
        };

        const responseMsg = responseMessage.content ?? '';
        return { responseMsg, data };
    }
}
