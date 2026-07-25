/**
 * In-memory cache for claim confidence evaluations
 */

export class ConfidenceCache {
  constructor() {
    /** @type {Map<string, import('../contracts/claimConfidence.contract.js').ClaimConfidence>} */
    this.cache = new Map();
  }

  /**
   * Generate cache key for claim confidence lookup
   * @param {string} claimId
   * @param {string} policyVersion
   * @returns {string}
   */
  static generateKey(claimId, policyVersion = '1.0.0') {
    return `${claimId}:${policyVersion}`;
  }

  /**
   * Get cached confidence evaluation
   * @param {string} key
   * @returns {import('../contracts/claimConfidence.contract.js').ClaimConfidence | null}
   */
  get(key) {
    return this.cache.get(key) || null;
  }

  /**
   * Store claim confidence evaluation in cache
   * @param {string} key
   * @param {import('../contracts/claimConfidence.contract.js').ClaimConfidence} value
   */
  set(key, value) {
    this.cache.set(key, value);
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
  }
}

export const defaultConfidenceCache = new ConfidenceCache();
