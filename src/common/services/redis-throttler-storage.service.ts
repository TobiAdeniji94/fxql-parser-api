import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';

/**
 * Redis-backed throttler storage with in-memory fallback
 * Requires REDIS_ENABLED=true and REDIS_URL in environment
 */
@Injectable()
export class RedisThrottlerStorageService
  implements ThrottlerStorage, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisThrottlerStorageService.name);
  private redis: any; // Type as 'any' until ioredis is installed
  private redisEnabled: boolean;

  async onModuleInit() {
    // Check if Redis is enabled
    this.redisEnabled = process.env.REDIS_ENABLED === 'true';

    if (this.redisEnabled) {
      try {
        // Dynamic import to avoid errors when ioredis not installed
        const Redis = (await import('ioredis')).default;
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => {
            if (times > 3) {
              this.logger.warn('Redis unavailable, falling back to in-memory storage');
              this.redisEnabled = false;
              return null;
            }
            return Math.min(times * 50, 2000);
          },
        });

        this.redis.on('error', (err: Error) => {
          this.logger.error('Redis error:', err);
        });

        this.redis.on('ready', () => {
          this.logger.log('✅ Redis connected for rate limiting');
        });
      } catch (error) {
        this.logger.warn('⚠️  Redis module not available, using in-memory storage');
        this.redisEnabled = false;
      }
    } else {
      this.logger.log('⚠️  Redis disabled (set REDIS_ENABLED=true), using in-memory rate limiting');
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async increment(key: string, ttl: number): Promise<any> {
    // If Redis not enabled, use in-memory fallback
    if (!this.redisEnabled || !this.redis) {
      return this.inMemoryIncrement(key, ttl);
    }

    try {
      const multi = this.redis.multi();
      const throttleKey = `throttle:${key}`;

      multi.incr(throttleKey);
      multi.pttl(throttleKey);
      multi.pexpire(throttleKey, ttl);

      const results = await multi.exec();

      const totalHits = results[0][1] as number;
      let timeToExpire = results[1][1] as number;

      // If key was just created, set expiration
      if (timeToExpire === -1) {
        timeToExpire = ttl;
      }

      return { totalHits, timeToExpire, isBlocked: false, timeToBlockExpire: 0 };
    } catch (error) {
      this.logger.error('Redis increment error, falling back to in-memory:', error);
      return this.inMemoryIncrement(key, ttl);
    }
  }

  // Fallback in-memory storage
  private storage = new Map<string, { hits: number; expiresAt: number }>();

  private inMemoryIncrement(key: string, ttl: number): any {
    const now = Date.now();
    const record = this.storage.get(key);

    if (!record || record.expiresAt < now) {
      const expiresAt = now + ttl;
      this.storage.set(key, { hits: 1, expiresAt });
      return { totalHits: 1, timeToExpire: ttl, isBlocked: false, timeToBlockExpire: 0 };
    }

    record.hits++;
    this.storage.set(key, record);
    
    return {
      totalHits: record.hits,
      timeToExpire: record.expiresAt - now,
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }

  // Cleanup expired in-memory keys periodically
  private cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of this.storage.entries()) {
      if (record.expiresAt < now) {
        this.storage.delete(key);
      }
    }
  }, 60000); // Every minute
}
