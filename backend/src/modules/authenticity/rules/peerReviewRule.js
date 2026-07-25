/**
 * Peer Review Status Rule
 * Evaluates peer-review status indicator.
 */

import { BaseRule } from './baseRule.js';

export class PeerReviewRule extends BaseRule {
  constructor() {
    super('RULE_PEER_REVIEW', 'Peer Review Status Rule', 'Evaluates peer-review indicator for academic sources');
  }

  execute(context) {
    let isPeerReviewed = false;

    if (context.registryMatch && context.registryMatch.peerReviewed) {
      isPeerReviewed = true;
    } else if (context.sourceType === 'Academic Journal' || context.sourceType === 'Scientific Publisher') {
      isPeerReviewed = true;
    }

    const score = isPeerReviewed ? 100 : 0;
    return {
      ruleId: this.id,
      factorImpacted: 'peerReviewedStatus',
      scoreContribution: score,
      flags: {
        peerReviewedStatus: score,
      },
    };
  }
}
