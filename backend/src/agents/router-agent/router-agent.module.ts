import { Module } from '@nestjs/common';
import { RouterAgentService } from './router-agent.service';

@Module({
  providers: [RouterAgentService],
  exports: [RouterAgentService],
})
export class RouterAgentModule {}
