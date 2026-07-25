/**
 * VerificationBatch Domain Model Container
 */

export class VerificationBatchModel {
  /**
   * @param {Object} params
   * @param {string} params.query
   * @param {import('../contracts/verifiedClaim.contract.js').VerifiedClaim[]} params.verifiedClaims
   * @param {Object} [params.executionSummary]
   */
  constructor({ query = '', verifiedClaims = [], executionSummary = {} }) {
    this.query = query;
    this.verifiedClaims = Array.isArray(verifiedClaims) ? verifiedClaims : [];
    this.totalClaims = this.verifiedClaims.length;
    this.executionSummary = {
      executionTimeMs: executionSummary.executionTimeMs || 0,
      supportedCount: this.verifiedClaims.filter(c => c.verificationStatus === 'SUPPORTED').length,
      partiallySupportedCount: this.verifiedClaims.filter(c => c.verificationStatus === 'PARTIALLY_SUPPORTED').length,
      contradictedCount: this.verifiedClaims.filter(c => c.verificationStatus === 'CONTRADICTED').length,
      insufficientCount: this.verifiedClaims.filter(c => c.verificationStatus === 'INSUFFICIENT_EVIDENCE').length,
      unverifiableCount: this.verifiedClaims.filter(c => c.verificationStatus === 'UNVERIFIABLE').length,
      ...executionSummary,
    };

    Object.freeze(this.verifiedClaims);
    Object.freeze(this.executionSummary);
    Object.freeze(this);
  }

  toJSON() {
    return {
      query: this.query,
      totalClaims: this.totalClaims,
      verifiedClaims: this.verifiedClaims.map(c => (c.toJSON ? c.toJSON() : c)),
      executionSummary: { ...this.executionSummary },
    };
  }
}
