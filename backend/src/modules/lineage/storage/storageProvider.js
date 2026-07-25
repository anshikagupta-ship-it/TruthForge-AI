/**
 * StorageProvider Base Abstract Class
 * Database-agnostic storage abstraction for lineage graphs
 */

export class StorageProvider {
  /**
   * Persist a lineage batch and memory graph
   * @param {import('../contracts/evidenceLineageBatch.contract.js').EvidenceLineageBatch} batch
   * @param {import('../graph/memoryGraph.js').MemoryGraph} graph
   * @returns {Promise<void>}
   */
  async saveGraph(batch, graph) {
    throw new Error('StorageProvider.saveGraph must be implemented by subclass.');
  }

  /**
   * Retrieve a lineage graph by batch ID
   * @param {string} batchId
   * @returns {Promise<import('../graph/memoryGraph.js').MemoryGraph|null>}
   */
  async getGraph(batchId) {
    throw new Error('StorageProvider.getGraph must be implemented by subclass.');
  }

  /**
   * Execute arbitrary domain query against storage engine
   * @param {Object} query
   * @returns {Promise<any>}
   */
  async query(query) {
    throw new Error('StorageProvider.query must be implemented by subclass.');
  }
}
