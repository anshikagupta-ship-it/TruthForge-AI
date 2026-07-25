/**
 * Content Validator
 * Enforces business logic requirements on verification explanations and statuses.
 */

import { VALID_VERIFICATION_STATUSES } from './schemaValidator.js';

export class ContentValidator {
  /**
   * Validates explanation content and status enum bounds
   * @param {Object} parsedPayload - Parsed LLM verification response object
   * @param {Object} [options]
   * @param {number} [options.minReasonLength=10]
   * @param {number} [options.maxReasonLength=1500]
   * @returns {{isValid: boolean, errors: string[]}}
   */
  static validate(parsedPayload, options = {}) {
    const minLen = options.minReasonLength || 10;
    const maxLen = options.maxReasonLength || 1500;
    const errors = [];

    const status = String(parsedPayload?.status || parsedPayload?.verificationStatus || '').toUpperCase();
    const explanation = String(parsedPayload?.reason || parsedPayload?.explanation || '').trim();

    // 1. Status Enum check
    if (!VALID_VERIFICATION_STATUSES.includes(status)) {
      errors.push(`ContentValidator: Invalid status '${status}'. Must be one of: ${VALID_VERIFICATION_STATUSES.join(', ')}.`);
    }

    // 2. Explanation non-emptiness & length bounds check
    if (!explanation || explanation.length < minLen) {
      errors.push(`ContentValidator: Explanation too short (${explanation.length} chars). Minimum ${minLen} characters required.`);
    } else if (explanation.length > maxLen) {
      errors.push(`ContentValidator: Explanation exceeds maximum allowed length (${explanation.length}/${maxLen} chars).`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
