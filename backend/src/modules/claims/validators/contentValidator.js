/**
 * Content Quality & Non-Speculation Validator
 */
export class ContentValidator {
  static SPECULATIVE_PATTERNS = [
    /\b(in my opinion|i think|i believe|probably|possibly|maybe|it seems|might be|could be|should consider)\b/i,
    /\b(we recommend|it is recommended|you should|we suggest)\b/i,
  ];

  /**
   * Validates claim content quality
   * @param {string} statement 
   * @returns {{ isValid: boolean, reason?: string }}
   */
  static validateContent(statement) {
    if (!statement || statement.length < 10) {
      return { isValid: false, reason: 'Statement too short (< 10 characters)' };
    }

    if (statement.length > 500) {
      return { isValid: false, reason: 'Statement exceeds maximum length limit (> 500 characters)' };
    }

    for (const pattern of this.SPECULATIVE_PATTERNS) {
      if (pattern.test(statement)) {
        return { isValid: false, reason: `Statement contains speculative or opinion language: "${statement}"` };
      }
    }

    return { isValid: true };
  }
}
