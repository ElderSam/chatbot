import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GroqService {
    private groqKey?: string;

    constructor(cfg: ConfigService) {
        this.groqKey = cfg.get<string>('GROQ_API_KEY') || undefined;
    }

    async chatCompletion({ prompt, model = 'llama-3.1-8b-instant', temperature = 0, max_tokens = 24 }) {
        if (!this.groqKey) throw new Error('GROQ_API_KEY not set');

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

        const data: any = await res.json();
        return data?.choices?.[0]?.message?.content ?? '';
    }
}
