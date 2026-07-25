import { ProviderFactory } from '../providers/providerFactory.js';
import { PromptRegistry } from '../prompts/promptRegistry.js';
import { ClaimParser } from '../parsers/claimParser.js';
import { SchemaValidator } from '../validators/schemaValidator.js';
import { LineageValidator } from '../validators/lineageValidator.js';
import { ContentValidator } from '../validators/contentValidator.js';
import { ClaimDeduplicator } from '../utils/claimDeduplicator.js';
import { ClaimModel } from '../models/claim.model.js';
import { ClaimBatchModel } from '../models/claimBatch.model.js';
import { logger } from '../../../utils/logger.js';

export class ClaimGeneratorService {
  /**
   * Main entry point: Transforms EvidenceBatch + EvidenceProfile into ClaimBatch
   * @param {import('../contracts/evidenceBatch.contract.js').EvidenceBatch} evidenceBatch 
   * @param {import('../contracts/evidenceProfile.contract.js').EvidenceProfile} [evidenceProfile] 
   * @param {Object} [options] 
   * @returns {Promise<import('../contracts/claimBatch.contract.js').ClaimBatch>}
   */
  static async generateClaims(evidenceBatch, evidenceProfile = null, options = {}) {
    const startTime = Date.now();
    const batchId = evidenceBatch?.batchId || `eb-${Math.random().toString(36).substring(2, 8)}`;
    const queryId = evidenceBatch?.queryId || 'q-unknown';
    const query = evidenceBatch?.query || '';
    const evidences = evidenceBatch?.evidences || [];

    logger.info(`[ClaimGenerator] Starting claim generation for Query ID: ${queryId} | Evidences: ${evidences.length}`, {
      batchId,
      queryId,
      totalEvidences: evidences.length,
    });

    // 1. Guard against empty evidence batch
    if (!evidences || evidences.length === 0) {
      logger.info('[ClaimGenerator] Empty evidence batch received. Returning empty ClaimBatch.');
      return new ClaimBatchModel({
        queryId,
        query,
        claims: [],
        executionSummary: {
          status: 'SUCCESS_EMPTY_INPUT',
          executionTimeMs: Date.now() - startTime,
          deduplicatedCount: 0,
        },
      }).toJSON();
    }

    // Map evidence IDs and source domains for rapid referential lookups
    const validEvidenceMap = new Map();
    evidences.forEach(e => {
      validEvidenceMap.set(e.evidenceId, e);
    });

    // 2. Resolve prompts & LLM provider
    const domain = options.domain || 'general';
    const systemPrompt = PromptRegistry.getSystemPrompt(domain);
    const userPrompt = PromptRegistry.getUserPrompt({
      query,
      evidences,
      qualityWarnings: evidenceProfile?.qualityWarnings || [],
    });

    const provider = options.provider || ProviderFactory.getProvider();

    let rawResponse = '';
    let providerName = provider.providerName;

    try {
      const result = await provider.generateJson(systemPrompt, userPrompt);
      rawResponse = result.rawResponse;
      providerName = result.provider || providerName;
    } catch (err) {
      logger.error(`[ClaimGenerator] Primary LLM provider call failed: ${err.message}. Retrying once...`);
      // Retry logic for LLM provider error
      try {
        const retryResult = await provider.generateJson(systemPrompt, userPrompt);
        rawResponse = retryResult.rawResponse;
      } catch (retryErr) {
        logger.error(`[ClaimGenerator] LLM retry also failed: ${retryErr.message}`);
        return new ClaimBatchModel({
          queryId,
          query,
          claims: [],
          executionSummary: {
            status: 'FAILED_LLM_PROVIDER_ERROR',
            error: retryErr.message,
            executionTimeMs: Date.now() - startTime,
          },
        }).toJSON();
      }
    }

    // 3. Parse LLM JSON output
    let rawClaimCandidates = [];
    try {
      rawClaimCandidates = ClaimParser.parseRawClaims(rawResponse);
    } catch (parseErr) {
      logger.error(`[ClaimGenerator] Failed to parse LLM response: ${parseErr.message}`);
      return new ClaimBatchModel({
        queryId,
        query,
        claims: [],
        executionSummary: {
          status: 'FAILED_PARSING_ERROR',
          error: parseErr.message,
          executionTimeMs: Date.now() - startTime,
        },
      }).toJSON();
    }

    // 4. Validate candidates (Schema, Lineage, Content Quality)
    const validClaimEntities = [];

    for (const rawCandidate of rawClaimCandidates) {
      // Structural Schema Check
      const schemaResult = SchemaValidator.validate(rawCandidate);
      if (!schemaResult.isValid) {
        logger.warn(`[ClaimGenerator] Schema validation failed: ${schemaResult.error}`);
        continue;
      }

      // Content Quality & Non-Speculation Check
      const contentResult = ContentValidator.validateContent(rawCandidate.statement);
      if (!contentResult.isValid) {
        logger.warn(`[ClaimGenerator] Content validation failed: ${contentResult.reason}`);
        continue;
      }

      // Evidence Lineage Check (Filter out hallucinated evidence IDs)
      const lineageResult = LineageValidator.validateEvidenceLineage(
        rawCandidate.supportingEvidenceIds,
        validEvidenceMap
      );

      if (lineageResult.validIds.length === 0) {
        logger.warn('[ClaimGenerator] Discarding claim: 0 valid supporting evidence IDs remain after lineage check.');
        continue;
      }

      // Resolve supporting source domains from evidence map
      const sourceDomains = lineageResult.validIds
        .map(id => validEvidenceMap.get(id)?.sourceDomain)
        .filter(Boolean);

      const claimEntity = new ClaimModel({
        statement: rawCandidate.statement,
        supportingEvidenceIds: lineageResult.validIds,
        sourceDomains,
        metadata: {
          generatedBy: providerName,
          generationTimestamp: new Date().toISOString(),
        },
      });

      validClaimEntities.push(claimEntity);
    }

    // 5. Claim Deduplication & Merging
    const { deduplicatedClaims, mergedCount } = ClaimDeduplicator.deduplicate(validClaimEntities);

    const executionTimeMs = Date.now() - startTime;
    logger.info(`[ClaimGenerator] Claim generation completed. Total Claims: ${deduplicatedClaims.length} (Merged: ${mergedCount}) in ${executionTimeMs}ms`);

    // 6. Build and return final ClaimBatch
    const batch = new ClaimBatchModel({
      batchId: `cb-${batchId.replace(/^eb-/, '')}`,
      queryId,
      query,
      claims: deduplicatedClaims,
      executionSummary: {
        status: 'SUCCESS',
        rawCandidateCount: rawClaimCandidates.length,
        extractedClaimCount: validClaimEntities.length,
        finalClaimCount: deduplicatedClaims.length,
        mergedCount,
        provider: providerName,
        executionTimeMs,
      },
    });

    return batch.toJSON();
  }
}
