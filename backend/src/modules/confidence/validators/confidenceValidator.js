/**
 * Input, config, and output validation safeguards
 */

export class ConfidenceValidator {
  /**
   * Validate raw input batches passed into Phase 6 engine
   * @param {Object} inputs
   */
  static validateInputBatches(inputs = {}) {
    const { VerificationBatch, EvidenceBatch } = inputs;

    if (!VerificationBatch || typeof VerificationBatch !== 'object') {
      throw new Error('Confidence Engine Validation Error: Missing or invalid VerificationBatch input');
    }

    if (!EvidenceBatch || typeof EvidenceBatch !== 'object') {
      throw new Error('Confidence Engine Validation Error: Missing or invalid EvidenceBatch input');
    }
  }

  /**
   * Validate computed ClaimConfidence object properties
   * @param {import('../contracts/claimConfidence.contract.js').ClaimConfidence} confidence
   */
  static validateOutputConfidence(confidence) {
    if (!confidence || typeof confidence !== 'object') {
      throw new Error('Confidence Validation Error: ClaimConfidence output is null or undefined');
    }

    if (typeof confidence.confidenceScore !== 'number' || Number.isNaN(confidence.confidenceScore)) {
      throw new Error(`Confidence Validation Error: Invalid score ${confidence.confidenceScore} for claim ${confidence.claimId}`);
    }

    if (confidence.confidenceScore < 0 || confidence.confidenceScore > 100) {
      throw new Error(`Confidence Validation Error: Score ${confidence.confidenceScore} out of bounds [0, 100] for claim ${confidence.claimId}`);
    }

    const validLevels = ['VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW', 'VERY_LOW'];
    if (!validLevels.includes(confidence.confidenceLevel)) {
      throw new Error(`Confidence Validation Error: Invalid level ${confidence.confidenceLevel} for claim ${confidence.claimId}`);
    }
  }
}
