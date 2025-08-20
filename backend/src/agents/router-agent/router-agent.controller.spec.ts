import { Test, TestingModule } from '@nestjs/testing';
import { RouterAgentController } from './router-agent.controller';
import { RouterAgentService } from './router-agent.service';

describe('RouterAgentController', () => {
  let controller: RouterAgentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouterAgentController],
      providers: [RouterAgentService],
    }).compile();

    controller = module.get<RouterAgentController>(RouterAgentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
