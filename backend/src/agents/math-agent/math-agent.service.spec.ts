import { Test, TestingModule } from '@nestjs/testing';
import { MathAgentService } from './math-agent.service';
import { ConfigService } from '@nestjs/config';
import { GroqService } from '../groq/groq.service';
import { RedisLoggerService } from '../../redis/redis-logger/redis-logger.service';

describe('MathAgentService', () => {
  let service: MathAgentService;
  let configService: jest.Mocked<ConfigService>;
  let groqService: jest.Mocked<GroqService>;
  let loggerService: jest.Mocked<RedisLoggerService>;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue('test-value')
    } as any;

    groqService = {
      chatCompletion: jest.fn().mockResolvedValue({
        responseMsg: '42',
        data: { calculation: 'completed' }
      })
    } as any;

    loggerService = {
      log: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn()
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MathAgentService,
        { provide: ConfigService, useValue: configService },
        { provide: GroqService, useValue: groqService },
        { provide: RedisLoggerService, useValue: loggerService },
      ],
    }).compile();

    service = module.get<MathAgentService>(MathAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should solve math expressions', async () => {
    const expression = '2 + 2';
    
    const result = await service.solve(expression);
    
    expect(groqService.chatCompletion).toHaveBeenCalledWith({
      prompt: expect.stringContaining(expression)
    });
    expect(result.responseMsg).toBe('42');
  });

  it('should handle calculation errors gracefully', async () => {
    groqService.chatCompletion = jest.fn().mockRejectedValue(new Error('API Error'));
    
    const result = await service.solve('invalid expression');
    
    expect(result.responseMsg).toBe('Error calculating math expression');
    expect(result.data).toEqual({ error: expect.any(Error) });
  });
});
