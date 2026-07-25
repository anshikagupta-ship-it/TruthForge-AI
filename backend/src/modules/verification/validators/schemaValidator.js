/**
 * Schema Validator
 * Validates structural integrity and data types of parsed verification JSON payloads.
 */

export const VALID_VERIFICATION_STATUSES = Object.freeze([
  'SUPPORTED',
  'PARTIALLY_SUPPORTED',
  'CONTRADICTED',
  'INSUFFICIENT_EVIDENCE',
  'UNVERIFIABLE',
]);

export class SchemaValidator {
  /**
   * Validates parsed JSON payload against structural verification contract rules
   * @param {Object} payload - Parsed JSON object from JsonResponseParser
   * @returns {{isValid: boolean, errors: string[]}} Validation result object
   */
  static validate(payload) {
    const errors = [];

    if (!payload || typeof payload !== 'object') {
      return { isValid: false, errors: ['Payload must be a non-null object.'] };
    }

    // 1. Validate 'status' field
    const status = payload.status || payload.verificationStatus;
    if (!status || typeof status !== 'string') {
      errors.push("Missing or non-string 'status' field.");
    } else if (!VALID_VERIFICATION_STATUSES.includes(status.toUpperCase())) {
      errors.push(`Invalid status '${status}'. Must be one of: ${VALID_VERIFICATION_STATUSES.join(', ')}.`);
    }

    // 2. Validate 'reason' / 'explanation' field
    const reason = payload.reason || payload.explanation;
    if (typeof reason !== 'string') {
      errors.push("Missing or non-string 'reason' field.");
    }

    // 3. Validate 'supportingEvidenceIds' field
    if (payload.supportingEvidenceIds !== undefined && !Array.isArray(payload.supportingEvidenceIds)) {
      errors.push("'supportingEvidenceIds' must be an array of evidence ID strings.");
    }

    // 4. Validate 'contradictingEvidenceIds' field
    if (payload.contradictingEvidenceIds !== undefined && !Array.isArray(payload.contradictingEvidenceIds)) {
      errors.push("'contradictingEvidenceIds' must be an array of evidence ID strings.");
    }

    // 5. Validate 'matchedEvidence' field if present
    if (payload.matchedEvidence !== undefined && !Array.isArray(payload.matchedEvidence)) {
      errors.push("'matchedEvidence' must be an array of evidence item objects.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
