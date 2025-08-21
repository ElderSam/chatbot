import { Module } from '@nestjs/common';
import { RouterAgentService } from './router-agent.service';
import { MathAgentModule } from '../math-agent/math-agent.module';
import { KnowledgeAgentModule } from '../knowledge-agent/knowledge-agent.module';
import { RedisLoggerModule } from 'src/redis-logger/redis-logger.module';

@Module({
  imports: [MathAgentModule, KnowledgeAgentModule, RedisLoggerModule],
  providers: [RouterAgentService],
  exports: [RouterAgentService],
})
export class RouterAgentModule {}
