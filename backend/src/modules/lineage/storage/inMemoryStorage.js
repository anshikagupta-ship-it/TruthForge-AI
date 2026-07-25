/**
 * InMemoryStorage Repository Implementation
 */

import { StorageProvider } from './storageProvider.js';

export class InMemoryStorage extends StorageProvider {
  constructor() {
    super();
    /** @type {Map<string, { batch: Object, graph: import('../graph/memoryGraph.js').MemoryGraph }>} */
    this.store = new Map();
  }

  async saveGraph(batch, graph) {
    if (!batch || !batch.batchId) {
      throw new Error('InMemoryStorage.saveGraph requires batch with valid batchId');
    }
    this.store.set(batch.batchId, { batch, graph });
  }

  async getGraph(batchId) {
    const entry = this.store.get(batchId);
    return entry ? entry.graph : null;
  }

  async getBatch(batchId) {
    const entry = this.store.get(batchId);
    return entry ? entry.batch : null;
  }

  async query(queryFn) {
    if (typeof queryFn === 'function') {
      return queryFn(this.store);
    }
    return Array.from(this.store.values());
  }

  clear() {
    this.store.clear();
  }
}
