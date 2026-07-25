/**
 * Structural Schema Validator for Claim Candidates
 */
export class SchemaValidator {
  /**
   * Validates structure of a raw extracted claim
   * @param {Object} rawClaim 
   * @returns {{ isValid: boolean, error?: string }}
   */
  static validate(rawClaim) {
    if (!rawClaim || typeof rawClaim !== 'object') {
      return { isValid: false, error: 'Claim object is null or not an object' };
    }

    if (typeof rawClaim.statement !== 'string' || rawClaim.statement.trim().length === 0) {
      return { isValid: false, error: 'Claim statement is empty or non-string' };
    }

    if (!Array.isArray(rawClaim.supportingEvidenceIds) || rawClaim.supportingEvidenceIds.length === 0) {
      return { isValid: false, error: 'Claim has no supporting evidence IDs' };
    }

    return { isValid: true };
  }
}
