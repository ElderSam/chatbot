import { Controller, Post, Get, UsePipes, ValidationPipe, Body, Query, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { ChatDto } from './dto/chat.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { SanitizePipe } from './pipes/sanitize.pipe';
import { RouterAgentService } from '../agents/router-agent/router-agent.service';
import { PromptGuardService } from './prompt-guard.service';
import { RedisCacheService } from '../redis/redis-cache/redis-cache.service';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly routerAgent: RouterAgentService,
        private readonly promptGuard: PromptGuardService,
        private readonly redis: RedisCacheService
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

    @Post('user')
    @UsePipes(new ValidationPipe({ 
        whitelist: true, 
        forbidNonWhitelisted: true, 
        transform: true 
    }), SanitizePipe)
    async createUser(@Body() payload: CreateUserDto) {
        const user_id = `client${Date.now()}`;
        const userData = {
            user_id,
            user_name: payload.user_name,
            created_at: new Date().toISOString()
        };

        await this.redis.set(`users:${user_id}`, userData);
        return { user_id };
    }

    @Post('chats/new') 
    @UsePipes(new ValidationPipe({ 
        whitelist: true, 
        forbidNonWhitelisted: true, 
        transform: true 
    }))
    async createChat(@Body() payload: CreateChatDto) {
        // Validate user exists
        const user = await this.redis.get(`users:${payload.user_id}`);
        if (!user) {
            throw new HttpException({
                message: 'User not found',
                error: 'Not Found',
                statusCode: 404
            }, HttpStatus.NOT_FOUND);
        }

        const conversation_id = `conv-${Date.now()}`;
        const chatData = {
            conversation_id,
            user_id: payload.user_id,
            created_at: new Date().toISOString()
        };

        // Store chat metadata
        await this.redis.set(`chat:conversation:${conversation_id}`, chatData);
        
        // Add to user's chat list
        const userChats = await this.redis.get(`chats:${payload.user_id}`) || [];
        userChats.push(conversation_id);
        await this.redis.set(`chats:${payload.user_id}`, userChats);

        return { conversation_id };
    }

    @Get('chats')
    async listChats(@Query('user_id') user_id: string) {
        if (!user_id || !user_id.match(/^client\d+$/)) {
            throw new HttpException({
                message: 'Invalid user_id format. Must be: client{number}',
                error: 'Bad Request',
                statusCode: 400
            }, HttpStatus.BAD_REQUEST);
        }

        // Validate user exists
        const user = await this.redis.get(`users:${user_id}`);
        if (!user) {
            throw new HttpException({
                message: 'User not found',
                error: 'Not Found', 
                statusCode: 404
            }, HttpStatus.NOT_FOUND);
        }

        const chatIds = await this.redis.get(`chats:${user_id}`) || [];
        const conversations: any[] = [];

        for (const chatId of chatIds) {
            const chatData = await this.redis.get(`chat:conversation:${chatId}`);
            if (chatData) {
                conversations.push(chatData);
            }
        }

        return { conversations };
    }

    @Get()
    async getConversation(
        @Query('user_id') user_id: string,
        @Query('conversation_id') conversation_id: string
    ) {
        if (!user_id || !user_id.match(/^client\d+$/)) {
            throw new HttpException({
                message: 'Invalid user_id format. Must be: client{number}',
                error: 'Bad Request',
                statusCode: 400
            }, HttpStatus.BAD_REQUEST);
        }

        if (!conversation_id || !conversation_id.match(/^conv-\d+$/)) {
            throw new HttpException({
                message: 'Invalid conversation_id format. Must be: conv-{number}',
                error: 'Bad Request', 
                statusCode: 400
            }, HttpStatus.BAD_REQUEST);
        }

        // Validate conversation exists and belongs to user
        const chatData = await this.redis.get(`chat:conversation:${conversation_id}`);
        if (!chatData || chatData.user_id !== user_id) {
            throw new HttpException({
                message: 'Conversation not found or access denied',
                error: 'Not Found',
                statusCode: 404
            }, HttpStatus.NOT_FOUND);
        }

        const history = await this.redis.get(`chat:history:${conversation_id}`) || [];
        return { 
            conversation: chatData,
            history 
        };
    }
}
