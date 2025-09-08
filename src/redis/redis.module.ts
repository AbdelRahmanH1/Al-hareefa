import { Global, Module } from '@nestjs/common';
import { RedisJwtService } from './redis-jwt.service';
import { createRedisConnection } from './redis.connection';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => createRedisConnection(),
    },
    RedisJwtService,
  ],
  exports: [RedisJwtService, 'REDIS_CLIENT'],
})
export class RedisModule {}
