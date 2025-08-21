import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisBaseService } from '../redis-base/redis-base.service';

@Injectable()
export class RedisLoggerService extends RedisBaseService {
    constructor(cfg: ConfigService) {
        super(cfg);
    }

    async log(agent: string, data: Record<string, any>, ttlSec = 900) {
        const key = `logs:${agent}:${Date.now()}`;
        await this.set(key, { ...data, agent }, ttlSec);
    }
}