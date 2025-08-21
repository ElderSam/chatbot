import { Module } from '@nestjs/common';
import { RedisBaseService } from './redis-base.service';

@Module({
  providers: [RedisBaseService],
  exports: [RedisBaseService],
})
export class RedisBaseModule {}
