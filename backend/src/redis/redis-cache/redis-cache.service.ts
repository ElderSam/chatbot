import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisBaseService } from '../redis-base/redis-base.service';

@Injectable()
export class RedisCacheService extends RedisBaseService {
    constructor(cfg: ConfigService) {
        super(cfg);
    }

    // Métodos específicos de cache, se necessário
}