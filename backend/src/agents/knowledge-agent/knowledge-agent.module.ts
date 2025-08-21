import { Module } from '@nestjs/common';
import { KnowledgeAgentService } from './knowledge-agent.service';
import { RedisLoggerModule } from 'src/redis-logger/redis-logger.module';
import { GroqModule } from '../groq/groq.module';

@Module({
  imports: [RedisLoggerModule, GroqModule],
  providers: [KnowledgeAgentService],
  exports: [KnowledgeAgentService],
})
export class KnowledgeAgentModule {}
