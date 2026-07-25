/**
 * ConfidenceBatch Domain Model Aggregate Root
 */

import { ClaimConfidenceModel } from './claimConfidence.model.js';

export class ConfidenceBatchModel {
  /**
   * @param {Partial<import('../contracts/confidenceBatch.contract.js').ConfidenceBatch>} [data={}]
   */
  constructor(data = {}) {
    this.batchId = data.batchId || `batch_conf_${Date.now()}`;
    this.query = data.query || '';
    
    const rawClaims = Array.isArray(data.claims) ? data.claims : [];
    this.claims = rawClaims.map((c) => new ClaimConfidenceModel(c).toJSON());
    this.totalClaims = typeof data.totalClaims === 'number' ? data.totalClaims : this.claims.length;

    this.metadata = {
      processedAt: (data.metadata && data.metadata.processedAt) || new Date().toISOString(),
      policyProfile: (data.metadata && data.metadata.policyProfile) || 'default',
      totalExecutionTimeMs: (data.metadata && data.metadata.totalExecutionTimeMs) || 0,
      engineVersion: (data.metadata && data.metadata.engineVersion) || '1.0.0',
      ...(data.metadata || {}),
    };
  }

  toJSON() {
    return {
      batchId: this.batchId,
      query: this.query,
      totalClaims: this.totalClaims,
      claims: this.claims,
      metadata: this.metadata,
    };
  }
}
