import { Controller } from '@nestjs/common';
import { RouterAgentService } from './router-agent.service';

@Controller()
export class RouterAgentController {
  constructor(private readonly routerAgentService: RouterAgentService) {}
}
