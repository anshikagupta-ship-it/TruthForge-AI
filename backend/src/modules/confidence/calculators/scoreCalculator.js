/**
 * Score Calculator for Phase 6 Confidence Engine
 */

import { MathUtils } from '../utils/mathUtils.js';

export class ScoreCalculator {
  /**
   * Compute final confidence score and categorical confidence level
   * @param {import('../contracts/confidenceFactors.contract.js').ConfidenceFactors} factors
   * @param {number} totalPenalties
   * @param {import('../config/policyConfig.js').PolicyConfig} policyConfig
   * @returns {{ confidenceScore: number, confidenceLevel: import('../contracts/claimConfidence.contract.js').ConfidenceLevel, rawWeightedScore: number }}
   */
  static calculateScore(factors, totalPenalties, policyConfig) {
    const weights = policyConfig.weights;

    // Calculate raw weighted sum
    const rawWeightedScore = MathUtils.calculateWeightedSum(factors, weights);

    // Apply cumulative penalties
    const penalizedScore = rawWeightedScore - totalPenalties;

    // Clamp score to [0, 100]
    const confidenceScore = Math.round(MathUtils.clamp(penalizedScore, 0, 100));

    // Map to categorical confidence level
    const confidenceLevel = policyConfig.mapScoreToLevel(confidenceScore);

    return {
      confidenceScore,
      confidenceLevel,
      rawWeightedScore,
    };
  }
}
