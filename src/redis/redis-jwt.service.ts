import {
  Injectable,
  OnModuleDestroy,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import Redis from 'ioredis';
import { asyncHandler } from 'src/shared/utils/async-handler';

@Injectable()
export class RedisJwtService implements OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {}
  saveToken = asyncHandler(
    async (userId: string, token: string) => {
      const key = `auth:${userId}:${token}`;
      await this.client.set(key, 'true');
    },
    'Failed to save token',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );

  validateToken = asyncHandler(
    async (userId: string, token: string): Promise<boolean> => {
      const key = `auth:${userId}:${token}`;
      const exists = await this.client.exists(key);
      return exists === 1;
    },
    'Failed to validate token',
    HttpStatus.UNAUTHORIZED,
  );

  revokeToken = asyncHandler(
    async (userId: string, token: string) => {
      const key = `auth:${userId}:${token}`;
      await this.client.del(key);
    },
    'Failed to revoke token',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );

  revokeAllTokens = asyncHandler(
    async (userId: string) => {
      const keys = await this.client.keys(`auth:${userId}:*`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    },
    'Failed to revoke all tokens',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );

  onModuleDestroy() {
    return this.client.quit();
  }
}
