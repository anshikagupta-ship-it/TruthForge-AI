/**
 * Abstract Cache Provider Interface
 */

export class CacheProvider {
  /**
   * Get item from cache
   * @param {string} key
   * @returns {Promise<Object|null>}
   */
  async get(key) {
    throw new Error('CacheProvider.get must be implemented');
  }

  /**
   * Set item in cache
   * @param {string} key
   * @param {Object} value
   * @param {number} [ttlSeconds]
   * @returns {Promise<void>}
   */
  async set(key, value, ttlSeconds) {
    throw new Error('CacheProvider.set must be implemented');
  }

  /**
   * Clear cache
   * @returns {Promise<void>}
   */
  async clear() {
    throw new Error('CacheProvider.clear must be implemented');
  }
}
