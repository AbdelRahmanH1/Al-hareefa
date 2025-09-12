import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisJwtService implements OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {}
  async saveToken(userId: string, token: string) {
    const key = `auth:${userId}:${token}`;
    await this.client.set(key, 'true');
  }

  async validateToken(userId: bigint, token: string): Promise<boolean> {
    const key = `auth:${userId}:${token}`;
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  async revokeToken(userId: bigint, token: string) {
    const key = `auth:${userId}:${token}`;
    await this.client.del(key);
  }

  async revokeAllTokens(userId: bigint) {
    const keys = await this.client.keys(`auth:${userId}:*`);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  onModuleDestroy() {
    return this.client.quit();
  }
}
