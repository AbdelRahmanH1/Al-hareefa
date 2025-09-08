export const redisConfig = {
  host: process.env.REDIS_HOT || `localhost`,
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  ttl: 60 * 60,
};
