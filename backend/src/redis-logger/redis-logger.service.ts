import { Injectable } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisLoggerService {
  private client: RedisClient;

    constructor(private cfg: ConfigService) {
        this.client = new Redis({
            host: this.cfg.get('REDIS_HOST', 'localhost'),
            port: Number(this.cfg.get('REDIS_PORT', 6379)),
            password: this.cfg.get('REDIS_PASSWORD') || undefined,
        });
    }

    async log(agent: string, data: Record<string, any>, ttlSec = 900) {
        const key = `logs:${agent}:${Date.now()}`;
        await this.client.set(key, JSON.stringify({ ...data, agent }), 'EX', ttlSec);
    }
}
