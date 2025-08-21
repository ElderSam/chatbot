import Redis, { Redis as RedisClient } from 'ioredis';
import { ConfigService } from '@nestjs/config';

export abstract class RedisBaseService {
    protected client: RedisClient;

    constructor(protected cfg: ConfigService) {
        this.client = new Redis({
            host: this.cfg.get('REDIS_HOST', 'localhost'),
            port: Number(this.cfg.get('REDIS_PORT', 6379)),
            password: this.cfg.get('REDIS_PASSWORD') || undefined,
        });
    }

    async get(key: string): Promise<any | null> {
        const val = await this.client.get(key);
        return val ? JSON.parse(val) : null;
    }

    async set(key: string, value: any, ttlSec?: number) {
        if (ttlSec) {
            await this.client.set(key, JSON.stringify(value), 'EX', ttlSec);
        } else {
            await this.client.set(key, JSON.stringify(value));
        }
    }
}