import { Global, Module } from '@nestjs/common';
import { AgentGraphService } from '@gitroom/nestjs-libraries/agent/agent.graph.service';
import { AgentGraphInsertService } from '@gitroom/nestjs-libraries/agent/agent.graph.insert.service';
import { ResearchAgentService } from '@gitroom/nestjs-libraries/agent/research.agent.service';

@Global()
@Module({
  providers: [AgentGraphService, AgentGraphInsertService, ResearchAgentService],
  get exports() {
    return this.providers;
  },
})
export class AgentModule {}
