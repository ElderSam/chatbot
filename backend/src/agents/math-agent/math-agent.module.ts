import { Module } from '@nestjs/common';
import { MathAgentService } from './math-agent.service';
import { GroqModule } from '../groq/groq.module';

@Module({
  imports: [GroqModule],
  providers: [MathAgentService],
  exports: [MathAgentService],
})
export class MathAgentModule {}
