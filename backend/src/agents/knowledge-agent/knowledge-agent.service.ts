import { Injectable } from '@nestjs/common';

@Injectable()
export class KnowledgeAgentService {
    async answer(question: string): Promise<string> {
        // const start = Date.now();

        // Simulação de resposta (ex.: chamada a LLM ou API externa)
        const answer = `Resposta simulada para: ${question}`;

        // const executionTime = Date.now() - start;

        return answer;
    }
}
