import { Controller, Post, UsePipes, ValidationPipe, Body, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { ChatDto } from './dto/chat.dto';
import { SanitizePipe } from './pipes/sanitize.pipe';
import { RouterAgentService } from '../agents/router-agent/router-agent.service';
import { PromptGuardService } from './prompt-guard.service';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly routerAgent: RouterAgentService,
        private readonly promptGuard: PromptGuardService
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
        if (this.promptGuard.isBlocked(payload.message)) {
            throw new ForbiddenException({
                response: this.promptGuard.getBlockReason(payload.message)
            });
        }
        let response = {};

        try {
            console.log('\n--------------------------------')
            console.log('/chat - start request: ', { payload })

            // Always use the original message for processing agents
            // The normalized cache is only for search/embedding purposes
            const messageToProcess = payload.message;

            // Delegate routing decision to RouterAgent
            const userContext = {
                user_id: payload.user_id,
                conversation_id: payload.conversation_id
            };
            const { chosenAgent, agentResult } = await this.routerAgent.routeAndHandle(messageToProcess ?? '', userContext);

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
            // Log the error for debugging
            console.error('Chat request failed:', error.message);
            
            // Return proper HTTP error status
            throw new HttpException({
                message: 'Unable to process your request. Please try again later.',
                error: 'Internal Server Error',
                statusCode: 500
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // console.log('/chat - end request: ', JSON.stringify({ response }))
        return response;
    }
}
