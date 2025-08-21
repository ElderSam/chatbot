import { Module } from '@nestjs/common';
import { RouterAgentService } from './router-agent.service';
import { MathAgentModule } from '../math-agent/math-agent.module';
import { KnowledgeAgentModule } from '../knowledge-agent/knowledge-agent.module';
import { RedisLoggerModule } from 'src/redis/redis-logger/redis-logger.module';
import { GroqModule } from '../groq/groq.module';

@Module({
  imports: [MathAgentModule, KnowledgeAgentModule, RedisLoggerModule, GroqModule],
  providers: [RouterAgentService],
  exports: [RouterAgentService],
})
export class RouterAgentModule {}
