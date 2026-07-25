/**
 * TLD Trust Rule
 * Evaluates TLD tier score.
 */

import { BaseRule } from './baseRule.js';
import { TldClassifier } from '../classifiers/tldClassifier.js';

export class TldTrustRule extends BaseRule {
  constructor() {
    super('RULE_TLD_TRUST', 'Top-Level Domain Trust Rule', 'Evaluates TLD trust tier (.gov, .edu, .int, .org, .com)');
  }

  execute(context) {
    const tldRes = TldClassifier.classifyTld(context.domain);
    return {
      ruleId: this.id,
      factorImpacted: 'topLevelDomainTrust',
      scoreContribution: tldRes.tldScore,
      flags: {
        topLevelDomainTrust: tldRes.tldScore,
        trustTier: tldRes.trustTier,
      },
    };
  }
}
