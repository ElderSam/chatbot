import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatController } from './chat/chat.controller';
import { PromptGuardService } from './chat/prompt-guard.service';
import { RouterAgentModule } from './agents/router-agent/router-agent.module';
import { RedisCacheModule } from './redis/redis-cache/redis-cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes config available everywhere
      envFilePath: 'config/env/.env', // specify the correct path
    }),
    RouterAgentModule,
    RedisCacheModule,
  ],
  controllers: [AppController, ChatController],
  providers: [AppService, PromptGuardService],
})
export class AppModule {}
