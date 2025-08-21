import { Injectable, OnModuleInit } from '@nestjs/common';
// import * as Redis from 'ioredis';

@Injectable()
export class RedisLoggerService implements OnModuleInit {
    // private client: Redis.Redis;

    onModuleInit() {
        // this.client = new Redis({
        //     host: 'localhost',
        //     port: 6379,
        // });
    }

    async log(agent: string, data: any) {
        const key = `logs:${agent}:${Date.now()}`;
        console.log(`Redis log NOT IMPLEMENTED YET - Key: ${key}, Data:`, data);
        // console.log(`Logging to Redis - Key: ${key}, Data:`, data);
        // await this.client.set(key, JSON.stringify(data), 'EX', 60 * 15); // expires in 15 min
    }
}
