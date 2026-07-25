/**
 * High-Level Pipeline Orchestration Service for Phase 6 Explainable Confidence Engine
 */

import { PolicyConfig, defaultPolicyConfig } from '../config/policyConfig.js';
import { FeatureExtractor } from '../extractors/featureExtractor.js';
import { FactorCalculator } from '../calculators/factorCalculator.js';
import { PenaltyEngine } from '../penalties/penaltyEngine.js';
import { ScoreCalculator } from '../calculators/scoreCalculator.js';
import { ExplanationBuilder } from '../explainers/explanationBuilder.js';
import { ConfidenceValidator } from '../validators/confidenceValidator.js';
import { defaultConfidenceCache } from '../cache/confidenceCache.js';
import { ClaimConfidenceModel } from '../models/claimConfidence.model.js';
import { ConfidenceBatchModel } from '../models/confidenceBatch.model.js';

export class ConfidenceEngineService {
  /**
   * @param {Object} [options={}]
   * @param {PolicyConfig} [options.policyConfig]
   * @param {typeof defaultConfidenceCache} [options.cache]
   */
  constructor(options = {}) {
    this.policyConfig = options.policyConfig || defaultPolicyConfig;
    this.cache = options.cache || defaultConfidenceCache;
    this.version = '1.0.0';
  }

  /**
   * Compute deterministic confidence scores for a batch of verified claims
   * @param {Object} inputs
   * @param {Object} inputs.VerificationBatch
   * @param {Object} inputs.EvidenceBatch
   * @param {Object} [inputs.EvidenceProfile]
   * @param {Object} [inputs.SourceAuthenticityBatch]
   * @param {Object} [inputs.EvidenceLineageBatch]
   * @returns {Promise<import('../contracts/confidenceBatch.contract.js').ConfidenceBatch>}
   */
  async computeConfidenceBatch(inputs) {
    const startTime = Date.now();

    // 1. Input Batch Validation
    ConfidenceValidator.validateInputBatches(inputs);

    const { VerificationBatch } = inputs;
    const claimsList = Array.isArray(VerificationBatch.claims) ? VerificationBatch.claims : [];
    const evaluatedClaims = [];

    // 2. Process each claim individually
    for (const claim of claimsList) {
      const claimStartTime = Date.now();
      try {
        const cacheKey = `${claim.claimId || claim.id}:${this.policyConfig.weightVersion}`;
        const cached = this.cache.get(cacheKey);
        if (cached) {
          evaluatedClaims.push(cached);
          continue;
        }

        const claimConfidence = this.evaluateSingleClaim(claim, inputs, claimStartTime);
        
        // Validate output contract
        ConfidenceValidator.validateOutputConfidence(claimConfidence);

        // Store in cache
        this.cache.set(cacheKey, claimConfidence);
        evaluatedClaims.push(claimConfidence);
      } catch (err) {
        // Degraded Mode Processing - Never crash pipeline for a single claim error
        console.warn(`[ConfidenceEngineService] Degraded confidence fallback for claim ${claim.claimId || claim.id}:`, err.message);
        const fallback = this.createDegradedClaimConfidence(claim, err, claimStartTime);
        evaluatedClaims.push(fallback);
      }
    }

    const totalExecutionTimeMs = Date.now() - startTime;

    // 3. Assemble Aggregate Root ConfidenceBatch
    const batchResult = new ConfidenceBatchModel({
      batchId: VerificationBatch.batchId ? `conf_${VerificationBatch.batchId}` : `conf_batch_${Date.now()}`,
      query: VerificationBatch.query || '',
      totalClaims: evaluatedClaims.length,
      claims: evaluatedClaims,
      metadata: {
        processedAt: new Date().toISOString(),
        policyProfile: this.policyConfig.policyProfile,
        totalExecutionTimeMs,
        engineVersion: this.version,
      },
    }).toJSON();

    // Structured JSON log output
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      stage: 'Confidence Engine',
      event: 'CONFIDENCE_BATCH_COMPLETED',
      batchId: batchResult.batchId,
      totalClaims: batchResult.totalClaims,
      totalExecutionTimeMs,
    }));

    return batchResult;
  }

  /**
   * Evaluate confidence for a single claim statement
   * @param {Object} claim
   * @param {Object} inputs
   * @param {number} claimStartTime
   * @returns {import('../contracts/claimConfidence.contract.js').ClaimConfidence}
   */
  evaluateSingleClaim(claim, inputs, claimStartTime) {
    const claimId = claim.claimId || claim.id || `claim_${Math.random().toString(36).substring(2, 9)}`;

    // A. Feature Extraction
    const features = FeatureExtractor.extractFeatures(claim, inputs);

    // B. Factor Calculation
    const factors = FactorCalculator.calculateFactors(features);

    // C. Penalty Evaluation
    const penaltyResult = PenaltyEngine.evaluatePenalties(features, this.policyConfig);

    // D. Score Calculation & Clamping
    const { confidenceScore, confidenceLevel } = ScoreCalculator.calculateScore(
      factors,
      penaltyResult.totalDeductions,
      this.policyConfig
    );

    // E. Explanation Generation
    const explanation = ExplanationBuilder.buildExplanation(
      features,
      factors,
      penaltyResult,
      confidenceScore,
      confidenceLevel
    );

    const executionTimeMs = Date.now() - claimStartTime;

    const result = new ClaimConfidenceModel({
      claimId,
      confidenceScore,
      confidenceLevel,
      confidenceFactors: factors,
      explanation,
      metadata: {
        evaluatedAt: new Date().toISOString(),
        engineVersion: this.version,
        weightVersion: this.policyConfig.weightVersion,
        penaltyVersion: this.policyConfig.penaltyVersion,
        executionTimeMs,
      },
    }).toJSON();

    // Structured JSON Log for Claim
    console.log(JSON.stringify({
      stage: 'Confidence Engine',
      event: 'CONFIDENCE_COMPUTED',
      claimId,
      score: confidenceScore,
      level: confidenceLevel,
      executionTimeMs,
    }));

    return result;
  }

  /**
   * Create degraded fallback ClaimConfidence on unexpected exception
   * @param {Object} claim
   * @param {Error} error
   * @param {number} claimStartTime
   * @returns {import('../contracts/claimConfidence.contract.js').ClaimConfidence}
   */
  createDegradedClaimConfidence(claim, error, claimStartTime) {
    const claimId = claim.claimId || claim.id || 'unknown_claim';
    const executionTimeMs = Date.now() - claimStartTime;

    return new ClaimConfidenceModel({
      claimId,
      confidenceScore: 0,
      confidenceLevel: 'VERY_LOW',
      confidenceFactors: {
        verificationStrength: 0,
        evidenceStrength: 0,
        sourceAuthenticity: 0,
        provenanceCompleteness: 0,
        evidenceAgreement: 0,
        evidenceCoverage: 0,
        contradictionPenalty: 0,
        retrievalQuality: 0,
      },
      explanation: {
        reasons: ['Confidence evaluation degraded due to missing features or input processing error.'],
        penalties: [`Engine exception: ${error.message}`],
        strengths: [],
      },
      metadata: {
        evaluatedAt: new Date().toISOString(),
        engineVersion: this.version,
        weightVersion: this.policyConfig.weightVersion,
        penaltyVersion: this.policyConfig.penaltyVersion,
        executionTimeMs,
        degradedMode: true,
      },
    }).toJSON();
  }
}
