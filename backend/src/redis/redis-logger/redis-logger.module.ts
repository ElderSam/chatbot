import { Module } from '@nestjs/common';
import { RedisLoggerService } from './redis-logger.service';

@Module({
  providers: [RedisLoggerService],
  exports: [RedisLoggerService],
})
export class RedisLoggerModule {}
