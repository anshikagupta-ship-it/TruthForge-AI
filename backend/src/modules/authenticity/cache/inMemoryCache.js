/**
 * In-Memory LRU Cache Implementation
 */

import { CacheProvider } from './cacheProvider.js';

export class InMemoryCache extends CacheProvider {
  /**
   * @param {number} [maxSize=10000]
   */
  constructor(maxSize = 10000) {
    super();
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  async get(key) {
    if (!this.cache.has(key)) return null;
    const entry = this.cache.get(key);

    // Check expiration if TTL set
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU position
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  async set(key, value, ttlSeconds = 86400) {
    if (this.cache.size >= this.maxSize) {
      // Evict oldest entry (first key in map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expiresAt });
  }

  async clear() {
    this.cache.clear();
  }
}
