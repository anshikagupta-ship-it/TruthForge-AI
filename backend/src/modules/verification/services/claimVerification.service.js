/**
 * Claim Verification Service
 * Main orchestrator service executing the Claim Verification pipeline (Phase 3).
 */

import { ProviderFactory } from '../../claims/providers/providerFactory.js';
import { EvidenceResolver } from '../resolvers/evidenceResolver.js';
import { VerificationContextBuilder } from '../resolvers/verificationContextBuilder.js';
import { PromptRegistry } from '../prompts/promptRegistry.js';
import { JsonResponseParser } from '../parsers/jsonResponseParser.js';
import { SchemaValidator } from '../validators/schemaValidator.js';
import { EvidenceValidator } from '../validators/evidenceValidator.js';
import { ContentValidator } from '../validators/contentValidator.js';
import { RetryPolicy } from '../utils/retryPolicy.js';
import { VerificationLogger } from '../utils/verificationLogger.js';
import { VerifiedClaimModel } from '../models/verifiedClaim.model.js';
import { VerificationBatchModel } from '../models/verificationBatch.model.js';
import { logger } from '../../../utils/logger.js';

export class ClaimVerificationService {
  /**
   * Primary Entrypoint: Verifies all claims in a ClaimBatch against supplied evidence
   * @param {Object} params
   * @param {Object} params.evidenceBatch - Input EvidenceBatch object
   * @param {Object} [params.evidenceProfile] - Input EvidenceProfile object (optional metadata)
   * @param {Object} params.claimBatch - Input ClaimBatch object containing array of claims
   * @param {Object} [options]
   * @param {string} [options.domain='general'] - Domain for prompt customization
   * @param {Object} [options.provider] - Optional override LLM provider
   * @param {number} [options.maxRetries=2] - Maximum LLM retry attempts
   * @returns {Promise<import('../contracts/verificationBatch.contract.js').VerificationBatch>}
   */
  static async verifyClaims({ evidenceBatch, evidenceProfile = null, claimBatch }, options = {}) {
    const startTime = Date.now();
    const query = claimBatch?.query || evidenceBatch?.query || '';
    const claims = claimBatch?.claims || (Array.isArray(claimBatch) ? claimBatch : []);
    const domain = options.domain || 'general';
    const provider = options.provider || ProviderFactory.getProvider();
    const maxRetries = options.maxRetries !== undefined ? options.maxRetries : 2;

    logger.info(`[ClaimVerificationService] Starting verification for ${claims.length} claims. Domain: '${domain}'`);

    // 1. Guard against empty claims input
    if (!claims || claims.length === 0) {
      logger.info('[ClaimVerificationService] Empty claim list provided. Returning empty VerificationBatch.');
      return new VerificationBatchModel({
        query,
        verifiedClaims: [],
        executionSummary: {
          executionTimeMs: Date.now() - startTime,
          note: 'SUCCESS_EMPTY_INPUT',
        },
      }).toJSON();
    }

    // 2. Resolve prompts for chosen domain
    const systemPrompt = PromptRegistry.getSystemPrompt(domain);

    // 3. Process claims concurrently with Promise.allSettled to guarantee batch isolation
    const verificationPromises = claims.map(claim =>
      this.verifySingleClaim({
        query,
        claim,
        evidenceBatch,
        systemPrompt,
        provider,
        maxRetries,
      })
    );

    const settledResults = await Promise.allSettled(verificationPromises);

    const verifiedClaims = settledResults.map((result, idx) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const claim = claims[idx];
        const claimId = claim.claimId || claim.id || `claim-${idx}`;
        const statement = claim.statement || '';
        logger.error(`[ClaimVerificationService] Unhandled failure verifying claim ${claimId}: ${result.reason?.message}`);
        return VerifiedClaimModel.createFallback(
          claimId,
          statement,
          `System error: ${result.reason?.message || 'Unhandled error'}`,
          0
        );
      }
    });

    const executionTimeMs = Date.now() - startTime;
    const batchModel = new VerificationBatchModel({
      query,
      verifiedClaims,
      executionSummary: {
        executionTimeMs,
        provider: provider.providerName,
        domain,
      },
    });

    VerificationLogger.logBatchCompleted({
      query,
      totalClaims: verifiedClaims.length,
      summary: batchModel.executionSummary,
      executionTimeMs,
    });

    return batchModel.toJSON();
  }

  /**
   * Internal helper: Verifies a single claim statement
   * @param {Object} params
   * @returns {Promise<VerifiedClaimModel>}
   */
  static async verifySingleClaim({ query, claim, evidenceBatch, systemPrompt, provider, maxRetries }) {
    const claimStartTime = Date.now();
    const claimId = claim.claimId || claim.id || `claim-${Math.random().toString(36).substring(2, 8)}`;
    const statement = claim.statement || '';

    VerificationLogger.logVerificationStarted({
      claimId,
      statement,
      evidenceCount: evidenceBatch?.evidences?.length || 0,
    });

    // Guard: empty claim statement
    if (!statement || statement.trim().length === 0) {
      return VerifiedClaimModel.createFallback(
        claimId,
        statement,
        'Claim statement is empty or invalid.',
        Date.now() - claimStartTime
      );
    }

    // Step A: Resolve evidence snippets for this claim
    const targetEvidenceIds = claim.supportingEvidenceIds || [];
    const resolvedEvidence = EvidenceResolver.resolve(evidenceBatch, targetEvidenceIds);

    if (!resolvedEvidence || resolvedEvidence.length === 0) {
      return new VerifiedClaimModel({
        claimId,
        statement,
        verificationStatus: 'UNVERIFIABLE',
        supportingEvidenceIds: [],
        contradictingEvidenceIds: [],
        explanation: 'No relevant evidence items were found in the supplied EvidenceBatch.',
        matchedEvidence: [],
        metadata: {
          executionTimeMs: Date.now() - claimStartTime,
        },
      });
    }

    // Step B: Build verification context & user prompt
    const evidenceContextBlock = VerificationContextBuilder.buildContext(claim, resolvedEvidence);
    const userPrompt = PromptRegistry.getUserPrompt({
      query,
      claim,
      evidenceContextBlock,
    });

    // Step C: Parse and validate function passed to RetryPolicy
    const parseAndValidate = (rawText) => {
      let parsedPayload = null;
      try {
        parsedPayload = JsonResponseParser.parse(rawText);
      } catch (parseErr) {
        VerificationLogger.logParserFailure({ claimId, errorDetails: parseErr.message });
        return { isValid: false, data: null, errors: [parseErr.message] };
      }

      // Stage 1: Schema Validation
      const schemaCheck = SchemaValidator.validate(parsedPayload);
      if (!schemaCheck.isValid) {
        VerificationLogger.logValidationFailure({ claimId, errors: schemaCheck.errors });
        return { isValid: false, data: null, errors: schemaCheck.errors };
      }

      // Stage 2: Evidence Reference Validation
      const evidenceCheck = EvidenceValidator.validate(parsedPayload, evidenceBatch);
      if (!evidenceCheck.isValid) {
        if (evidenceCheck.invalidIds.length > 0) {
          VerificationLogger.logHallucinationDetected({
            claimId,
            invalidReferences: evidenceCheck.invalidIds,
            hallucinationType: 'UNKNOWN_EVIDENCE_ID',
          });
        }
        VerificationLogger.logValidationFailure({ claimId, errors: evidenceCheck.errors });
        return { isValid: false, data: null, errors: evidenceCheck.errors };
      }

      // Stage 3: Content Validation
      const contentCheck = ContentValidator.validate(parsedPayload);
      if (!contentCheck.isValid) {
        VerificationLogger.logValidationFailure({ claimId, errors: contentCheck.errors });
        return { isValid: false, data: null, errors: contentCheck.errors };
      }

      return {
        isValid: true,
        data: {
          status: String(parsedPayload.status || parsedPayload.verificationStatus).toUpperCase(),
          reason: String(parsedPayload.reason || parsedPayload.explanation).trim(),
          supportingEvidenceIds: evidenceCheck.cleanedSupporting,
          contradictingEvidenceIds: evidenceCheck.cleanedContradicting,
          matchedEvidence: Array.isArray(parsedPayload.matchedEvidence)
            ? parsedPayload.matchedEvidence
            : resolvedEvidence.map(ev => ({
                evidenceId: ev.evidenceId,
                relevance: ev.retrievalScore,
                notes: 'Evaluated snippet.',
              })),
        },
        errors: [],
      };
    };

    // Step D: Execute LLM call via RetryPolicy
    const retryResult = await RetryPolicy.executeWithRetry({
      executeFn: (sys, user) => provider.generateJson(sys, user),
      parseAndValidateFn: parseAndValidate,
      claimId,
      systemPrompt,
      userPrompt,
      maxRetries,
    });

    const executionTimeMs = Date.now() - claimStartTime;

    if (!retryResult.success || !retryResult.data) {
      return VerifiedClaimModel.createFallback(
        claimId,
        statement,
        retryResult.error || 'Verification failed validation checks after retries.',
        executionTimeMs
      );
    }

    const { status, reason, supportingEvidenceIds, contradictingEvidenceIds, matchedEvidence } = retryResult.data;

    const verifiedClaim = new VerifiedClaimModel({
      claimId,
      statement,
      verificationStatus: status,
      supportingEvidenceIds,
      contradictingEvidenceIds,
      explanation: reason,
      matchedEvidence,
      metadata: {
        verifier: `TruthForge-LLMVerifier (${provider.providerName})`,
        verifierVersion: 'v3.1.0',
        promptVersion: 'v1.2.0',
        executionTimeMs,
        retryCount: retryResult.retryCount,
      },
    });

    VerificationLogger.logClaimVerified({
      claimId,
      status,
      executionTimeMs,
      retryCount: retryResult.retryCount,
    });

    return verifiedClaim;
  }
}
