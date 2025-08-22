import { Controller, Post, UsePipes, ValidationPipe, Body } from '@nestjs/common';
import { ChatDto } from './dto/chat.dto';
import { SanitizePipe } from './pipes/sanitize.pipe';
import { RouterAgentService } from '../agents/router-agent/router-agent.service';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly routerAgent: RouterAgentService,
    ) {}

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }), SanitizePipe)
    async handleChat(@Body() payload: ChatDto) {

        let response = {};

        try {
            console.log('\n--------------------------------')
            console.log('/chat - start request: ', { payload })

            // Delegate routing decision to RouterAgent
            const { chosenAgent, agentResult } = await this.routerAgent.routeAndHandle(payload.message ?? '');

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
