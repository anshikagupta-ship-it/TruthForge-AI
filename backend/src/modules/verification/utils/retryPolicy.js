/**
 * Retry Policy & Automatic Repair Handler
 * Controls retry execution loop and constructs targeted repair prompts on validation/parsing failures.
 */

import { VerificationLogger } from './verificationLogger.js';

export class RetryPolicy {
  /**
   * Generates automatic repair prompt instructing LLM to fix specific validation/JSON errors
   * @param {string} originalUserPrompt
   * @param {string} failedRawOutput
   * @param {string[]} validationErrors
   * @returns {string} Formatted repair prompt
   */
  static buildRepairPrompt(originalUserPrompt, failedRawOutput, validationErrors) {
    return `${originalUserPrompt}

======================================================================
CRITICAL REPAIR INSTRUCTION (PREVIOUS ATTEMPT FAILED VALIDATION)
======================================================================
Your previous response failed structural verification for the following reasons:
${validationErrors.map(err => `- ${err}`).join('\n')}

YOUR PREVIOUS INVALID OUTPUT WAS:
"""
${failedRawOutput ? failedRawOutput.substring(0, 500) : '[EMPTY]'}
"""

CORRECTIVE REQUIREMENTS:
1. Return ONLY a valid, raw JSON object.
2. Fix all listed validation errors.
3. Refer ONLY to valid evidence IDs provided in the context above.
4. Set status to one of: "SUPPORTED", "PARTIALLY_SUPPORTED", "CONTRADICTED", "INSUFFICIENT_EVIDENCE", "UNVERIFIABLE".`;
  }

  /**
   * Executes LLM verification call with automatic retry policy
   * @param {Object} params
   * @param {Function} params.executeFn - Async function executing LLM provider call
   * @param {Function} params.parseAndValidateFn - Function receiving raw text and returning {isValid, data, errors}
   * @param {string} params.claimId
   * @param {string} params.systemPrompt
   * @param {string} params.userPrompt
   * @param {number} [params.maxRetries=2]
   * @returns {Promise<{success: boolean, data: Object|null, rawResponse: string, retryCount: number, error: string|null}>}
   */
  static async executeWithRetry({
    executeFn,
    parseAndValidateFn,
    claimId,
    systemPrompt,
    userPrompt,
    maxRetries = 2,
  }) {
    let currentPrompt = userPrompt;
    let attempt = 0;
    let lastRawResponse = '';
    let lastErrors = [];

    while (attempt <= maxRetries) {
      if (attempt > 0) {
        VerificationLogger.logRetryAttempt({
          claimId,
          attemptNumber: attempt,
          reason: lastErrors.join('; '),
        });
      }

      try {
        const result = await executeFn(systemPrompt, currentPrompt);
        lastRawResponse = result?.rawResponse || '';

        const validation = parseAndValidateFn(lastRawResponse);
        if (validation.isValid) {
          return {
            success: true,
            data: validation.data,
            rawResponse: lastRawResponse,
            retryCount: attempt,
            error: null,
          };
        }

        lastErrors = validation.errors || ['Validation failed'];
      } catch (err) {
        lastErrors = [err.message];
      }

      attempt++;
      if (attempt <= maxRetries) {
        currentPrompt = this.buildRepairPrompt(userPrompt, lastRawResponse, lastErrors);
      }
    }

    return {
      success: false,
      data: null,
      rawResponse: lastRawResponse,
      retryCount: maxRetries,
      error: `Failed after ${maxRetries} retries. Errors: ${lastErrors.join('; ')}`,
    };
  }
}
