import { Module } from '@nestjs/common';
import { MathAgentService } from './math-agent.service';
import { GroqModule } from '../groq/groq.module';
import { RedisLoggerModule } from '../../redis/redis-logger/redis-logger.module';

@Module({
  imports: [GroqModule, RedisLoggerModule],
  providers: [MathAgentService],
  exports: [MathAgentService],
})
export class MathAgentModule {}
