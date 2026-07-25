import crypto from 'crypto';

/**
 * Claim Domain Model
 * Represents a single atomic factual claim extracted from evidence.
 */
export class ClaimModel {
  /**
   * @param {Object} params
   * @param {string} [params.claimId]
   * @param {string} params.statement
   * @param {string[]} params.supportingEvidenceIds
   * @param {string[]} [params.sourceDomains]
   * @param {string} [params.generatedAt]
   * @param {Object} [params.metadata]
   */
  constructor({
    claimId,
    statement,
    supportingEvidenceIds = [],
    sourceDomains = [],
    generatedAt,
    metadata = {},
  }) {
    this.claimId = claimId || `claim-${Math.random().toString(36).substring(2, 10)}`;
    this.statement = statement ? statement.trim() : '';
    this.supportingEvidenceIds = Array.from(new Set(supportingEvidenceIds));
    this.sourceDomains = Array.from(new Set(sourceDomains));
    this.generatedAt = generatedAt || new Date().toISOString();
    
    this.metadata = {
      evidenceCount: this.supportingEvidenceIds.length,
      sourceCount: this.sourceDomains.length,
      generatedBy: metadata.generatedBy || 'system/claim-generator',
      generationTimestamp: metadata.generationTimestamp || this.generatedAt,
      deduplicatedFromCount: metadata.deduplicatedFromCount || 1,
      ...metadata,
    };
  }

  /**
   * Converts entity to plain JSON object matching Claim contract
   */
  toJSON() {
    return {
      claimId: this.claimId,
      statement: this.statement,
      supportingEvidenceIds: this.supportingEvidenceIds,
      sourceDomains: this.sourceDomains,
      generatedAt: this.generatedAt,
      metadata: this.metadata,
    };
  }
}
