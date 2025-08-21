import { Module } from '@nestjs/common';
import { KnowledgeAgentService } from './knowledge-agent.service';
import { RedisLoggerModule } from 'src/redis-logger/redis-logger.module';

@Module({
  imports: [RedisLoggerModule],
  providers: [KnowledgeAgentService],
  exports: [KnowledgeAgentService],
})
export class KnowledgeAgentModule {}
