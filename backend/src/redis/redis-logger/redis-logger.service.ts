import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisBaseService } from '../redis-base/redis-base.service';

type LogLevel = 'INFO' | 'DEBUG' | 'ERROR';

interface BaseLogData {
  conversation_id?: string;
  user_id?: string;
  execution_time?: number;
  [key: string]: any;
}

@Injectable()
export class RedisLoggerService extends RedisBaseService {
    constructor(cfg: ConfigService) {
        super(cfg);
    }

    async log(
        agent: string, 
        data: BaseLogData, 
        level: LogLevel = 'INFO',
        ttlSec = 900
    ) {
        const timestamp = new Date().toISOString();
        const key = `logs:${agent}:${Date.now()}`;
        
        const logEntry = {
            timestamp,
            level,
            agent,
            ...data
        };

        await this.set(key, logEntry, ttlSec);
        
        // Also log to console for development
        console.log(JSON.stringify(logEntry, null, 2));
    }

    async info(agent: string, data: BaseLogData, ttlSec = 900) {
        await this.log(agent, data, 'INFO', ttlSec);
    }

    async debug(agent: string, data: BaseLogData, ttlSec = 900) {
        await this.log(agent, data, 'DEBUG', ttlSec);
    }

    async error(agent: string, data: BaseLogData, ttlSec = 900) {
        await this.log(agent, data, 'ERROR', ttlSec);
    }
}