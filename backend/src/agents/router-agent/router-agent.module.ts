import { Module } from '@nestjs/common';
import { RouterAgentService } from './router-agent.service';
import { MathAgentModule } from '../math-agent/math-agent.module';

@Module({
  imports: [MathAgentModule],
  providers: [RouterAgentService],
  exports: [RouterAgentService],
})
export class RouterAgentModule {}
