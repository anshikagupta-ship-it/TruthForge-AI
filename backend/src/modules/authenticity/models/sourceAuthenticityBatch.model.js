/**
 * SourceAuthenticityBatch Domain Model Class
 */

import crypto from 'crypto';

export class SourceAuthenticityBatchModel {
  /**
   * @param {Partial<import('../contracts/sourceAuthenticityBatch.contract.js').SourceAuthenticityBatch>} data
   */
  constructor(data = {}) {
    this.batchId = data.batchId || 'sab_' + crypto.randomBytes(8).toString('hex');
    this.query = data.query || '';
    this.evaluatedSources = data.evaluatedSources || [];
    this.totalSources = typeof data.totalSources === 'number' ? data.totalSources : this.evaluatedSources.length;
    this.generatedAt = data.generatedAt || new Date().toISOString();
    this.executionSummary = data.executionSummary || {
      totalExecutionTimeMs: 0,
      cacheHitRatio: 0.0,
      failedEvaluations: 0,
    };
  }

  toJSON() {
    return {
      batchId: this.batchId,
      query: this.query,
      totalSources: this.totalSources,
      evaluatedSources: this.evaluatedSources.map(s => (typeof s.toJSON === 'function' ? s.toJSON() : s)),
      generatedAt: this.generatedAt,
      executionSummary: this.executionSummary,
    };
  }
}
