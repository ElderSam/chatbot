import { Injectable } from '@nestjs/common';
import { RedisLoggerService } from 'src/redis-logger/redis-logger.service';

@Injectable()
export class KnowledgeAgentService {
    constructor(private readonly logger: RedisLoggerService) {}

    async answer(question: string): Promise<string> {
        const start = Date.now();

        // Simulação de resposta (ex.: chamada a LLM ou API externa)
        const answer = `Resposta simulada para: ${question}`;

        const executionTime = Date.now() - start;
        await this.logger.log('knowledge-agent', {
            question,
            answer,
            executionTime,
        });

        return answer;
    }
}
