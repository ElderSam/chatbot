import { Module } from '@nestjs/common';
import { MathAgentService } from './math-agent.service';

@Module({
  providers: [MathAgentService],
  exports: [MathAgentService],
})
export class MathAgentModule {}
