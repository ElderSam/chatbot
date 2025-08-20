import { Module } from '@nestjs/common';
import { KnowledgeAgentService } from './knowledge-agent.service';

@Module({
  providers: [KnowledgeAgentService],
  exports: [KnowledgeAgentService],
})
export class KnowledgeAgentModule {}
