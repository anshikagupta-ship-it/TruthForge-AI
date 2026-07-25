/**
 * Rule Registry Container
 * Manages registered rule instances for execution.
 */

import { RegistryMatchRule } from './registryMatchRule.js';
import { TldTrustRule } from './tldTrustRule.js';
import { SecurityRule } from './securityRule.js';
import { PublisherTypeRule } from './publisherTypeRule.js';
import { PeerReviewRule } from './peerReviewRule.js';

export class RuleRegistry {
  constructor() {
    this.rules = [
      new RegistryMatchRule(),
      new TldTrustRule(),
      new SecurityRule(),
      new PublisherTypeRule(),
      new PeerReviewRule(),
    ];
  }

  /**
   * Get default rule instances
   * @returns {import('./baseRule.js').BaseRule[]}
   */
  static getDefaultRules() {
    return new RuleRegistry().rules;
  }
}
