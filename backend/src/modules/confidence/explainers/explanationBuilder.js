/**
 * Explanation Builder for Phase 6 Confidence Engine
 * Deterministically constructs reasons, penalties, and strengths arrays using StringTemplates
 */

import { StringTemplates } from '../utils/stringTemplates.js';

export class ExplanationBuilder {
  /**
   * Build explanation vectors for evaluated claim confidence
   * @param {import('../extractors/featureExtractor.js').ExtractedFeatures} features
   * @param {import('../contracts/confidenceFactors.contract.js').ConfidenceFactors} factors
   * @param {import('./penaltyEngine.js').PenaltyResult} penaltyResult
   * @param {number} finalScore
   * @param {import('../contracts/claimConfidence.contract.js').ConfidenceLevel} level
   * @returns {import('../contracts/confidenceExplanation.contract.js').ConfidenceExplanation}
   */
  static buildExplanation(features, factors, penaltyResult, finalScore, level) {
    const strengths = [];
    const penalties = [];
    const reasons = [];

    // 1. Build Strengths
    if (factors.sourceAuthenticity >= 85) {
      strengths.push(StringTemplates.Strengths.HIGH_AUTHORITY_SOURCES);
    }
    if (features.supportingCount >= 3) {
      strengths.push(StringTemplates.render(StringTemplates.Strengths.MULTIPLE_INDEPENDENT_SOURCES, { count: features.supportingCount }));
    }
    if (factors.provenanceCompleteness >= 90) {
      strengths.push(StringTemplates.Strengths.COMPLETE_LINEAGE);
    }
    if (features.evidenceAgreementRatio >= 0.9 && features.supportingCount > 1) {
      strengths.push(StringTemplates.Strengths.HIGH_CONSENSUS);
    }
    if (features.avgSemanticScore >= 85) {
      strengths.push(StringTemplates.Strengths.STRONG_RETRIEVAL);
    }

    // 2. Build Penalties
    for (const p of penaltyResult.appliedPenalties) {
      penalties.push(p.description);
    }

    // 3. Build High-Level Reasons
    switch (level) {
      case 'VERY_HIGH':
        reasons.push(StringTemplates.SummaryReasons.VERY_HIGH_CONFIDENCE);
        break;
      case 'HIGH':
        reasons.push(StringTemplates.SummaryReasons.HIGH_CONFIDENCE);
        break;
      case 'MEDIUM':
        reasons.push(StringTemplates.SummaryReasons.MEDIUM_CONFIDENCE);
        break;
      case 'LOW':
        reasons.push(StringTemplates.SummaryReasons.LOW_CONFIDENCE);
        break;
      case 'VERY_LOW':
      default:
        reasons.push(StringTemplates.SummaryReasons.VERY_LOW_CONFIDENCE);
        break;
    }

    // Add contextual breakdown sentence
    if (strengths.length > 0) {
      reasons.push(`Key positive driver: ${strengths[0]}`);
    }
    if (penalties.length > 0) {
      reasons.push(`Primary risk factor: ${penalties[0]}`);
    }

    return {
      reasons,
      penalties,
      strengths,
    };
  }
}
