/**
 * LineageCache Manager
 * Manages caching for batch lineage graphs, claim subgraphs, and node relationships
 */

import { InMemoryCacheProvider } from './cacheProvider.js';

export class LineageCache {
  /**
   * @param {import('./cacheProvider.js').CacheProvider} [cacheProvider]
   */
  constructor(cacheProvider = new InMemoryCacheProvider()) {
    this.provider = cacheProvider;
  }

  /**
   * Cache complete EvidenceLineageBatch
   * @param {import('../contracts/evidenceLineageBatch.contract.js').EvidenceLineageBatch} batch
   * @param {number} [ttlSeconds]
   */
  async cacheBatch(batch, ttlSeconds) {
    if (!batch || !batch.batchId) return;
    const key = `truthforge:lineage:batch:${batch.batchId}`;
    await this.provider.set(key, batch, ttlSeconds);
  }

  /**
   * Get cached EvidenceLineageBatch
   * @param {string} batchId
   * @returns {Promise<import('../contracts/evidenceLineageBatch.contract.js').EvidenceLineageBatch|null>}
   */
  async getBatch(batchId) {
    if (!batchId) return null;
    const key = `truthforge:lineage:batch:${batchId}`;
    return this.provider.get(key);
  }

  /**
   * Cache claim subgraph
   * @param {string} claimId
   * @param {import('../contracts/claimLineage.contract.js').ClaimLineage} claimLineage
   * @param {number} [ttlSeconds]
   */
  async cacheClaimLineage(claimId, claimLineage, ttlSeconds) {
    if (!claimId) return;
    const key = `truthforge:lineage:claim:${claimId}`;
    await this.provider.set(key, claimLineage, ttlSeconds);
  }

  /**
   * Get cached claim subgraph
   * @param {string} claimId
   * @returns {Promise<import('../contracts/claimLineage.contract.js').ClaimLineage|null>}
   */
  async getClaimLineage(claimId) {
    if (!claimId) return null;
    const key = `truthforge:lineage:claim:${claimId}`;
    return this.provider.get(key);
  }
}
