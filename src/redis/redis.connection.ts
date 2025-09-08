import Redis, { Redis as RedisClient } from 'ioredis';
import { redisConfig } from 'src/config/redisConfig';

export const createRedisConnection = (): RedisClient => {
  const client = new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
  });

  client.on('connect', () => {
    console.log('redis connect successfully');
  });

  client.on('error', (err) => {
    console.error('redis error', err);
  });

  return client;
};
