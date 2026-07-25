/**
 * StorageProvider Contract Interface
 * Abstract contract definition for graph storage adapters
 *
 * @typedef {Object} StorageProviderInterface
 * @property {function(import('./evidenceLineageBatch.contract.js').EvidenceLineageBatch, import('../graph/memoryGraph.js').MemoryGraph): Promise<void>} saveGraph
 * @property {function(string): Promise<import('../graph/memoryGraph.js').MemoryGraph | null>} getGraph
 * @property {function(Object): Promise<any>} query
 */

export {};
