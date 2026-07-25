/**
 * Factor Calculator for Phase 6 Confidence Engine
 * Computes 8 sub-factor numerical scores [0-100] from ExtractedFeatures
 */

import { MathUtils } from '../utils/mathUtils.js';

export class FactorCalculator {
  /**
   * Calculate sub-factor values from extracted features
   * @param {import('../extractors/featureExtractor.js').ExtractedFeatures} features
   * @returns {import('../contracts/confidenceFactors.contract.js').ConfidenceFactors}
   */
  static calculateFactors(features) {
    // 1. Verification Strength
    const verificationStrength = FactorCalculator.calculateVerificationStrength(features.verificationStatus);

    // 2. Evidence Strength
    const evidenceStrength = MathUtils.clamp(
      (0.45 * features.avgSemanticScore) +
      (0.35 * features.avgRetrievalScore) +
      (0.20 * features.evidenceQualityScore)
    );

    // 3. Source Authenticity
    const sourceAuthenticity = MathUtils.clamp(features.avgSourceAuthenticityScore);

    // 4. Provenance Completeness
    const provenanceCompleteness = MathUtils.clamp(features.provenanceCompletenessRatio * 100);

    // 5. Evidence Agreement
    const agreementFactor = features.evidenceAgreementRatio * 100;
    const supportScale = Math.min(1.0, MathUtils.safeRatio(features.supportingCount, 3, 0));
    const evidenceAgreement = MathUtils.clamp(agreementFactor * (features.supportingCount > 0 ? (0.7 + 0.3 * supportScale) : 0));

    // 6. Evidence Coverage
    const evidenceCoverage = MathUtils.clamp(features.evidenceCoverageRatio * 100);

    // 7. Contradiction Penalty Metric
    const contradictionPenalty = MathUtils.clamp(
      Math.max(0, 100 - (features.contradictingCount * 35))
    );

    // 8. Retrieval Quality
    const retrievalQuality = MathUtils.clamp(
      (0.60 * features.avgRetrievalScore) +
      (0.40 * features.domainDiversityScore * 100)
    );

    return {
      verificationStrength,
      evidenceStrength,
      sourceAuthenticity,
      provenanceCompleteness,
      evidenceAgreement,
      evidenceCoverage,
      contradictionPenalty,
      retrievalQuality,
    };
  }

  /**
   * Derive verification strength factor from verdict string
   * @param {string} status
   * @returns {number}
   */
  static calculateVerificationStrength(status) {
    switch (status) {
      case 'SUPPORTED':
        return 100;
      case 'PARTIALLY_SUPPORTED':
        return 70;
      case 'CONTRADICTED':
        return 20;
      case 'INSUFFICIENT_EVIDENCE':
        return 10;
      case 'UNVERIFIABLE':
      default:
        return 0;
    }
  }
}
