/**
 * Score Calculator
 * Aggregates rule execution outputs, applies configured factor weights, and normalizes final score (0-100).
 */

import { AuthenticityConfig } from '../config/authenticityConfig.js';
import { RuleRegistry } from '../rules/ruleRegistry.js';

export class ScoreCalculator {
  /**
   * Execute evaluation rules and compute normalized score & AuthenticityLevel
   * @param {Object} context
   * @param {string} context.domain
   * @param {string} context.protocol
   * @param {Object} [context.registryMatch]
   * @param {string} context.sourceType
   * @param {Array<import('../rules/baseRule.js').BaseRule>} [customRules]
   * @returns {{
   *   score: number,
   *   level: import('../contracts/sourceAuthenticityProfile.contract.js').AuthenticityLevel,
   *   factors: import('../contracts/authenticityFactors.contract.js').AuthenticityFactors,
   *   rulesApplied: string[]
   * }}
   */
  static calculate(context, customRules = null) {
    const rules = customRules || RuleRegistry.getDefaultRules();
    const weights = AuthenticityConfig.getWeights();
    const rulesApplied = [];

    const factorScores = {
      institutionRecognition: 0,
      topLevelDomainTrust: 0,
      securityProtocol: 0,
      authorityRegistryMatch: 0,
      publisherTypeWeight: 0,
      peerReviewedStatus: 0,
    };

    const booleanFlags = {
      isResearchRepository: false,
      isGovernmentOwned: false,
      isMedicalAuthority: false,
      isEducationalInstitution: false,
      isStandardsOrganization: false,
      isInternationalOrganization: false,
    };

    // 1. Execute pluggable rule suite
    for (const rule of rules) {
      rulesApplied.push(rule.id);
      const res = rule.execute(context);

      if (res.factorImpacted && factorScores[res.factorImpacted] !== undefined) {
        factorScores[res.factorImpacted] = res.scoreContribution;
      }

      if (res.flags) {
        Object.keys(booleanFlags).forEach(flagKey => {
          if (res.flags[flagKey] === true) {
            booleanFlags[flagKey] = true;
          }
        });
        if (typeof res.flags.institutionRecognition === 'number') {
          factorScores.institutionRecognition = res.flags.institutionRecognition;
        }
      }
    }

    // 2. Compute weighted raw score
    let rawScore = 0;
    rawScore += (factorScores.authorityRegistryMatch || 0) * (weights.authorityRegistryMatch || 0.35);
    rawScore += (factorScores.institutionRecognition || 0) * (weights.institutionRecognition || 0.25);
    rawScore += (factorScores.topLevelDomainTrust || 0) * (weights.topLevelDomainTrust || 0.15);
    rawScore += (factorScores.publisherTypeWeight || 0) * (weights.publisherTypeWeight || 0.10);
    rawScore += (factorScores.peerReviewedStatus || 0) * (weights.peerReviewedStatus || 0.10);
    rawScore += (factorScores.securityProtocol || 0) * (weights.securityProtocol || 0.05);

    // 3. Normalize score 0 - 100
    const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));
    const level = AuthenticityConfig.mapScoreToLevel(finalScore);

    const evaluationFactors = {
      ...factorScores,
      ...booleanFlags,
    };

    return {
      score: finalScore,
      level,
      factors: evaluationFactors,
      rulesApplied,
    };
  }
}
