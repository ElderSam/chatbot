import { Controller, Post, UsePipes, ValidationPipe, Body } from '@nestjs/common';
import { ChatDto } from './dto/chat.dto';
import { SanitizePipe, normalizedMessageCache } from './pipes/sanitize.pipe';
import { RouterAgentService } from '../agents/router-agent/router-agent.service';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly routerAgent: RouterAgentService,
    ) {}

    @Post()
    @UsePipes(
        new ValidationPipe({ 
            whitelist: true, 
            forbidNonWhitelisted: true, 
            transform: true // Habilita transformações para usar @Transform
        }), 
        SanitizePipe
    )
    async handleChat(@Body() payload: ChatDto) {

        let response = {};

        try {
            console.log('\n--------------------------------')
            console.log('/chat - start request: ', { payload })

            // Get normalized message from cache if available, fallback to original
            const cacheKey = `${payload.conversation_id}:${payload.user_id}`;
            const normalizedMessage = normalizedMessageCache.get(cacheKey);
            const messageToProcess = normalizedMessage || payload.message;

            // Delegate routing decision to RouterAgent
            const { chosenAgent, agentResult } = await this.routerAgent.routeAndHandle(messageToProcess ?? '');

            response = {
                response: agentResult.responseMsg,
                source_agent_response: agentResult.data,
                agent_workflow: [
                    { agent: 'RouterAgent', decision: chosenAgent },
                    { agent: chosenAgent }
                ]
            };
        }
        catch (error: any) {
            // Retorna erro ao usuário
            response = {
                statusCode: error.statusCode || 500,
                error: error.message || 'Agent routing failed',
                details: error.response?.data || error.stack || null,
            };
        }
        console.log('/chat - end request: ', JSON.stringify({ response }))
        return response;
    }
}
