/**
 * Security Protocol Rule
 * Evaluates transport encryption security protocol (HTTPS = 100, HTTP = 0).
 */

import { BaseRule } from './baseRule.js';

export class SecurityRule extends BaseRule {
  constructor() {
    super('RULE_SECURITY_PROTOCOL', 'Security Protocol Rule', 'Evaluates HTTPS usage and transport security');
  }

  execute(context) {
    const isHttps = context.protocol === 'https';
    const score = isHttps ? 100 : 0;
    return {
      ruleId: this.id,
      factorImpacted: 'securityProtocol',
      scoreContribution: score,
      flags: {
        securityProtocol: score,
      },
    };
  }
}
