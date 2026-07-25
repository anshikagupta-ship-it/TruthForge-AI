/**
 * VerifiedClaim Domain Model Entity
 */

export class VerifiedClaimModel {
  /**
   * @param {Object} params
   * @param {string} params.claimId
   * @param {string} params.statement
   * @param {import('../contracts/verifiedClaim.contract.js').VerificationStatus} params.verificationStatus
   * @param {string[]} [params.supportingEvidenceIds]
   * @param {string[]} [params.contradictingEvidenceIds]
   * @param {string} params.explanation
   * @param {import('../contracts/verifiedClaim.contract.js').MatchedEvidenceItem[]} [params.matchedEvidence]
   * @param {Object} [params.metadata]
   */
  constructor({
    claimId,
    statement,
    verificationStatus = 'UNVERIFIABLE',
    supportingEvidenceIds = [],
    contradictingEvidenceIds = [],
    explanation = '',
    matchedEvidence = [],
    metadata = {},
  }) {
    this.claimId = claimId;
    this.statement = statement;
    this.verificationStatus = verificationStatus;
    this.supportingEvidenceIds = Array.isArray(supportingEvidenceIds) ? [...new Set(supportingEvidenceIds)] : [];
    this.contradictingEvidenceIds = Array.isArray(contradictingEvidenceIds) ? [...new Set(contradictingEvidenceIds)] : [];
    this.explanation = String(explanation || '').trim();
    this.matchedEvidence = Array.isArray(matchedEvidence) ? matchedEvidence : [];
    this.metadata = {
      verifiedAt: metadata.verifiedAt || new Date().toISOString(),
      verifier: metadata.verifier || 'TruthForge-LLMVerifier',
      verifierVersion: metadata.verifierVersion || 'v3.1.0',
      promptVersion: metadata.promptVersion || 'v1.2.0',
      executionTimeMs: metadata.executionTimeMs || 0,
      isFallback: Boolean(metadata.isFallback),
      ...metadata,
    };

    Object.freeze(this.supportingEvidenceIds);
    Object.freeze(this.contradictingEvidenceIds);
    Object.freeze(this.matchedEvidence);
    Object.freeze(this.metadata);
    Object.freeze(this);
  }

  toJSON() {
    return {
      claimId: this.claimId,
      statement: this.statement,
      verificationStatus: this.verificationStatus,
      supportingEvidenceIds: [...this.supportingEvidenceIds],
      contradictingEvidenceIds: [...this.contradictingEvidenceIds],
      explanation: this.explanation,
      matchedEvidence: [...this.matchedEvidence],
      metadata: { ...this.metadata },
    };
  }

  /**
   * Factory method to create fallback VerifiedClaim entity on failure
   * @param {string} claimId
   * @param {string} statement
   * @param {string} reason
   * @param {number} executionTimeMs
   * @returns {VerifiedClaimModel}
   */
  static createFallback(claimId, statement, reason, executionTimeMs = 0) {
    return new VerifiedClaimModel({
      claimId,
      statement,
      verificationStatus: 'UNVERIFIABLE',
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [],
      explanation: reason || 'Verification engine failed to produce valid evaluation.',
      matchedEvidence: [],
      metadata: {
        executionTimeMs,
        isFallback: true,
      },
    });
  }
}
