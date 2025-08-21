import { Module } from '@nestjs/common';
import { RouterAgentService } from './router-agent.service';
import { MathAgentModule } from '../math-agent/math-agent.module';
import { KnowledgeAgentModule } from '../knowledge-agent/knowledge-agent.module';

@Module({
  imports: [MathAgentModule, KnowledgeAgentModule],
  providers: [RouterAgentService],
  exports: [RouterAgentService],
})
export class RouterAgentModule {}
