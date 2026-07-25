/**
 * EvidenceLineageBatch Aggregate Root Domain Model
 */

import crypto from 'crypto';
import { lineageConfig } from '../config/lineageConfig.js';

export class EvidenceLineageBatchModel {
  /**
   * @param {Object} params
   * @param {string} [params.batchId]
   * @param {string} [params.query]
   * @param {number} [params.totalClaims]
   * @param {import('../contracts/claimLineage.contract.js').ClaimLineage[]} [params.lineage]
   * @param {import('../contracts/evidenceLineageBatch.contract.js').LineageMetadata} [params.metadata]
   */
  constructor({ batchId, query = '', totalClaims, lineage = [], metadata = {} }) {
    this.batchId = batchId || 'elb_' + crypto.randomBytes(8).toString('hex');
    this.query = query;
    this.lineage = lineage;
    this.totalClaims = typeof totalClaims === 'number' ? totalClaims : this.lineage.length;
    this.metadata = {
      generatedAt: metadata.generatedAt || new Date().toISOString(),
      generatorVersion: metadata.generatorVersion || lineageConfig.generatorVersion,
      graphVersion: metadata.graphVersion || lineageConfig.graphVersion,
      graphHash: metadata.graphHash || '',
      executionTimeMs: metadata.executionTimeMs || 0,
      validationSummary: metadata.validationSummary || {
        totalNodes: 0,
        totalEdges: 0,
        orphanNodes: 0,
        missingReferences: 0,
        duplicateEdgesRemoved: 0,
        isValid: true,
      },
    };
  }

  toJSON() {
    return {
      batchId: this.batchId,
      query: this.query,
      totalClaims: this.totalClaims,
      lineage: this.lineage.map((item) => (typeof item.toJSON === 'function' ? item.toJSON() : item)),
      metadata: this.metadata,
    };
  }
}
