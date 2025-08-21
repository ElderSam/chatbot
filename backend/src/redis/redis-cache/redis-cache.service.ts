import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisBaseService } from '../redis-base/redis-base.service';

@Injectable()
export class RedisCacheService extends RedisBaseService {
    constructor(cfg: ConfigService) {
        super(cfg);
    }

    async getCache(key: string): Promise<any | null> {
        // Prefixo para evitar colisão com outros dados
        return await this.get(`cache:${key}`);
    }

    async setCache(key: string, value: any, ttlSec = 86400) {
        await this.set(`cache:${key}`, value, ttlSec);
    }
}