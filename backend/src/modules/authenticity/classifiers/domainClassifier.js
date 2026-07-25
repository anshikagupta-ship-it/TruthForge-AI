/**
 * Domain Classifier Router
 * Combines TLD classification and Authority Registry matching to categorize domain source types.
 */

import { TldClassifier } from './tldClassifier.js';

export class DomainClassifier {
  /**
   * Categorize domain into one of 15 canonical SourceType categories
   * @param {string} domain
   * @param {Object} [registryMatch] - Optional match entity from Authority Registry
   * @returns {import('../contracts/sourceAuthenticityProfile.contract.js').SourceType}
   */
  static classifyDomain(domain, registryMatch = null) {
    // 1. Authority Registry match overrides default TLD category
    if (registryMatch && registryMatch.sourceType) {
      return registryMatch.sourceType;
    }

    // 2. Known domain pattern heuristics
    if (domain) {
      const lower = domain.toLowerCase();
      if (lower.includes('wikipedia.org') || lower.includes('fandom.com')) {
        return 'Community Wiki';
      }
      if (lower.includes('reddit.com') || lower.includes('stackoverflow.com') || lower.includes('quora.com')) {
        return 'Forum';
      }
      if (lower.includes('twitter.com') || lower.includes('x.com') || lower.includes('linkedin.com') || lower.includes('facebook.com')) {
        return 'Social Media';
      }
      if (lower.includes('arxiv.org') || lower.includes('biorxiv.org') || lower.includes('medrxiv.org')) {
        return 'Research Repository';
      }
      if (lower.includes('medium.com') || lower.includes('substack.com') || lower.includes('wordpress.com') || lower.includes('blogspot.com')) {
        return 'Blog';
      }
    }

    // 3. Fallback to TLD classification
    const tldRes = TldClassifier.classifyTld(domain);
    return tldRes.category;
  }
}
