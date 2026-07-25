/**
 * CacheProvider Abstract Interface
 */

export class CacheProvider {
  /**
   * @template T
   * @param {string} key
   * @returns {Promise<T|null>}
   */
  async get(key) {
    throw new Error('CacheProvider.get must be implemented by subclass.');
  }

  /**
   * @template T
   * @param {string} key
   * @param {T} value
   * @param {number} [ttlSeconds]
   * @returns {Promise<void>}
   */
  async set(key, value, ttlSeconds) {
    throw new Error('CacheProvider.set must be implemented by subclass.');
  }

  /**
   * @param {string} key
   * @returns {Promise<void>}
   */
  async del(key) {
    throw new Error('CacheProvider.del must be implemented by subclass.');
  }
}

export class InMemoryCacheProvider extends CacheProvider {
  constructor() {
    super();
    this.map = new Map();
  }

  async get(key) {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key, value, ttlSeconds = 3600) {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.map.set(key, { value, expiresAt });
  }

  async del(key) {
    this.map.delete(key);
  }
}
