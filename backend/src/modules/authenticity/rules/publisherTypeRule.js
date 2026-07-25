/**
 * Publisher Type Weight Rule
 * Evaluates category baseline weight.
 */

import { BaseRule } from './baseRule.js';

export class PublisherTypeRule extends BaseRule {
  constructor() {
    super('RULE_PUBLISHER_TYPE', 'Publisher Type Weight Rule', 'Evaluates publisher class weight');
  }

  execute(context) {
    const typeWeights = {
      'Government': 100,
      'Academic Journal': 98,
      'Scientific Publisher': 95,
      'Medical Organization': 95,
      'International Organization': 95,
      'University': 95,
      'Standards Organization': 95,
      'Research Repository': 85,
      'News Organization': 75,
      'Commercial': 40,
      'Community Wiki': 35,
      'Blog': 20,
      'Forum': 15,
      'Social Media': 10,
      'Unknown': 20,
    };

    const score = typeWeights[context.sourceType] || 20;
    return {
      ruleId: this.id,
      factorImpacted: 'publisherTypeWeight',
      scoreContribution: score,
      flags: {
        publisherTypeWeight: score,
      },
    };
  }
}
