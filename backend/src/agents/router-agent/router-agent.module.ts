import { Module } from '@nestjs/common';
import { RouterAgentService } from './router-agent.service';
import { RouterAgentController } from './router-agent.controller';

@Module({
  controllers: [RouterAgentController],
  providers: [RouterAgentService],
})
export class RouterAgentModule {}
