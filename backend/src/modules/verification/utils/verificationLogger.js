/**
 * Verification Logger
 * Emits structured JSON log entries for auditability, tracing, and metrics aggregation.
 */

import { logger as baseLogger } from '../../../utils/logger.js';

export class VerificationLogger {
  /**
   * Log claim verification started
   */
  static logVerificationStarted({ claimId, statement, evidenceCount }) {
    baseLogger.info(`[ClaimVerification] Verification started for Claim ID: ${claimId}`, {
      stage: 'Claim Verification',
      event: 'VERIFICATION_STARTED',
      claimId,
      statementSnippet: statement ? `${statement.substring(0, 60)}...` : '',
      evidenceCount,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log successful claim verification
   */
  static logClaimVerified({ claimId, status, executionTimeMs, retryCount = 0 }) {
    baseLogger.info(`[ClaimVerification] Claim verified: ${claimId} -> ${status} (${executionTimeMs}ms)`, {
      stage: 'Claim Verification',
      event: 'CLAIM_VERIFIED',
      claimId,
      status,
      executionTimeMs,
      retryCount,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log retry attempt
   */
  static logRetryAttempt({ claimId, attemptNumber, reason }) {
    baseLogger.warn(`[ClaimVerification] Retry attempt #${attemptNumber} for Claim ID: ${claimId}. Reason: ${reason}`, {
      stage: 'Claim Verification',
      event: 'VERIFICATION_RETRY_ATTEMPTED',
      claimId,
      attemptNumber,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log JSON parser failure
   */
  static logParserFailure({ claimId, errorDetails }) {
    baseLogger.error(`[ClaimVerification] Parser failure for Claim ID: ${claimId}. Error: ${errorDetails}`, {
      stage: 'Claim Verification',
      event: 'PARSER_FAILURE',
      claimId,
      errorDetails,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log hallucinated evidence reference detected
   */
  static logHallucinationDetected({ claimId, invalidReferences, hallucinationType }) {
    baseLogger.error(`[ClaimVerification] Hallucination detected for Claim ID: ${claimId} [${hallucinationType}]: Invalid IDs [${invalidReferences.join(', ')}]`, {
      stage: 'Claim Verification',
      event: 'HALLUCINATION_DETECTED',
      claimId,
      hallucinationType,
      invalidReferences,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log validation failure
   */
  static logValidationFailure({ claimId, errors }) {
    baseLogger.warn(`[ClaimVerification] Validation failure for Claim ID: ${claimId}. Errors: ${errors.join('; ')}`, {
      stage: 'Claim Verification',
      event: 'VALIDATION_FAILED',
      claimId,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log batch verification completed summary
   */
  static logBatchCompleted({ query, totalClaims, summary, executionTimeMs }) {
    baseLogger.info(`[ClaimVerification] Batch verification completed. Query: "${query}" | Claims: ${totalClaims} | Time: ${executionTimeMs}ms`, {
      stage: 'Claim Verification',
      event: 'BATCH_VERIFICATION_COMPLETED',
      query,
      totalClaims,
      summary,
      executionTimeMs,
      timestamp: new Date().toISOString(),
    });
  }
}
