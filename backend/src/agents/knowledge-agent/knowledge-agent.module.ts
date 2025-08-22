import { Module } from '@nestjs/common';
import { KnowledgeAgentService } from './knowledge-agent.service';
import { EmbeddingService } from './embedding.service';
import { RedisCacheModule } from '../../redis/redis-cache/redis-cache.module';
import { RedisLoggerModule } from '../../redis/redis-logger/redis-logger.module';
import { GroqModule } from '../groq/groq.module';

@Module({
  imports: [RedisCacheModule, RedisLoggerModule, GroqModule],
  providers: [KnowledgeAgentService, EmbeddingService],
  exports: [KnowledgeAgentService, EmbeddingService],
})
export class KnowledgeAgentModule { }
