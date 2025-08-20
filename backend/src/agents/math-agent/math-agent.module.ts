import { Module } from '@nestjs/common';
import { MathAgentService } from './math-agent.service';
import { MathAgentController } from './math-agent.controller';

@Module({
  controllers: [MathAgentController],
  providers: [MathAgentService],
})
export class MathAgentModule {}
