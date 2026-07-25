/**
 * Redis Cache Adapter Implementation (with In-Memory Fallback)
 */

import { CacheProvider } from './cacheProvider.js';
import { InMemoryCache } from './inMemoryCache.js';
import { logger } from '../../../utils/logger.js';

export class RedisCache extends CacheProvider {
  /**
   * @param {Object} [redisClient] - Redis client instance
   */
  constructor(redisClient = null) {
    super();
    this.redisClient = redisClient;
    this.fallbackCache = new InMemoryCache();
  }

  async get(key) {
    if (!this.redisClient) {
      return this.fallbackCache.get(key);
    }
    try {
      const data = await this.redisClient.get(`truthforge:authenticity:v1:${key}`);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.warn(`[RedisCache] Cache get failed, falling back to memory: ${err.message}`);
      return this.fallbackCache.get(key);
    }
  }

  async set(key, value, ttlSeconds = 86400) {
    // Always sync local fallback
    await this.fallbackCache.set(key, value, ttlSeconds);

    if (!this.redisClient) return;

    try {
      await this.redisClient.set(
        `truthforge:authenticity:v1:${key}`,
        JSON.stringify(value),
        'EX',
        ttlSeconds
      );
    } catch (err) {
      logger.warn(`[RedisCache] Cache set failed: ${err.message}`);
    }
  }

  async clear() {
    await this.fallbackCache.clear();
  }
}
