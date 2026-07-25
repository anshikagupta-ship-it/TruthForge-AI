/**
 * Penalty Engine for Phase 6 Confidence Engine
 * Evaluates risk indicators and computes cumulative penalty deductions
 */

/**
 * @typedef {Object} PenaltyResult
 * @property {number} totalDeductions
 * @property {Array<{ rule: string, points: number, description: string }>} appliedPenalties
 */

export class PenaltyEngine {
  /**
   * Evaluate all configured penalty rules against extracted features
   * @param {import('../extractors/featureExtractor.js').ExtractedFeatures} features
   * @param {import('../config/policyConfig.js').PolicyConfig} policyConfig
   * @returns {PenaltyResult}
   */
  static evaluatePenalties(features, policyConfig) {
    const penaltyRules = policyConfig.penalties;
    const appliedPenalties = [];
    let totalDeductions = 0;

    // 1. Contradicting Evidence Penalty
    if (features.contradictingCount > 0) {
      const cfg = penaltyRules.contradictingEvidence || { baseDeductionPerItem: 15, maxDeduction: 45 };
      const points = Math.min(cfg.maxDeduction, features.contradictingCount * cfg.baseDeductionPerItem);
      totalDeductions += points;
      appliedPenalties.push({
        rule: 'contradictingEvidence',
        points,
        description: `Confidence reduced by ${features.contradictingCount} conflicting evidence source(s).`,
      });
    }

    // 2. Low Source Diversity Penalty
    if (features.domainDiversityScore < 0.5 && features.supportingCount > 1) {
      const cfg = penaltyRules.lowSourceDiversity || { deduction: 15 };
      totalDeductions += cfg.deduction;
      appliedPenalties.push({
        rule: 'lowSourceDiversity',
        points: cfg.deduction,
        description: 'Low source diversity; evidence relies heavily on a single domain.',
      });
    }

    // 3. Broken Provenance Penalty
    if (features.provenanceCompletenessRatio < 0.75) {
      const cfg = penaltyRules.brokenProvenance || { deduction: 25 };
      totalDeductions += cfg.deduction;
      appliedPenalties.push({
        rule: 'brokenProvenance',
        points: cfg.deduction,
        description: 'Incomplete provenance lineage graph detected.',
      });
    }

    // 4. Weak Retrieval Penalty
    if (features.avgRetrievalScore < 50 && features.supportingCount > 0) {
      const cfg = penaltyRules.weakRetrieval || { deduction: 12 };
      totalDeductions += cfg.deduction;
      appliedPenalties.push({
        rule: 'weakRetrieval',
        points: cfg.deduction,
        description: 'Low semantic relevance score from retrieval phase.',
      });
    }

    // 5. Unknown Sources Penalty
    if (features.unknownDomainCount > 0) {
      const cfg = penaltyRules.unknownSources || { deductionPerUnknown: 10, maxDeduction: 30 };
      const points = Math.min(cfg.maxDeduction, features.unknownDomainCount * cfg.deductionPerUnknown);
      totalDeductions += points;
      appliedPenalties.push({
        rule: 'unknownSources',
        points,
        description: `Evidence includes ${features.unknownDomainCount} unverified or unknown domain source(s).`,
      });
    }

    // 6. Missing Evidence Penalty
    if (features.supportingCount === 0 && features.verificationStatus !== 'UNVERIFIABLE') {
      const cfg = penaltyRules.missingEvidence || { deduction: 35 };
      totalDeductions += cfg.deduction;
      appliedPenalties.push({
        rule: 'missingEvidence',
        points: cfg.deduction,
        description: 'Claim lacks direct supporting evidence snippets.',
      });
    }

    return {
      totalDeductions,
      appliedPenalties,
    };
  }
}
