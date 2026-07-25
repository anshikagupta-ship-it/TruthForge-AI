/**
 * TLD Classifier
 * Deterministically maps domain TLDs to default SourceType categories and trust tiers.
 */

export class TldClassifier {
  /**
   * Classify TLD trust tier and default category
   * @param {string} domain
   * @returns {{ tld: string, category: import('../contracts/sourceAuthenticityProfile.contract.js').SourceType, trustTier: string, tldScore: number }}
   */
  static classifyTld(domain) {
    if (!domain || typeof domain !== 'string') {
      return { tld: '', category: 'Unknown', trustTier: 'TIER_4', tldScore: 30 };
    }

    const cleanDomain = domain.toLowerCase().trim();
    const parts = cleanDomain.split('.');
    const tld = parts.slice(1).join('.'); // e.g. 'gov', 'ac.uk', 'edu'
    const lastTld = parts[parts.length - 1];

    if (cleanDomain.endsWith('.gov') || cleanDomain.includes('.gov.')) {
      return { tld: 'gov', category: 'Government', trustTier: 'TIER_1', tldScore: 100 };
    }
    if (cleanDomain.endsWith('.mil') || cleanDomain.includes('.mil.')) {
      return { tld: 'mil', category: 'Government', trustTier: 'TIER_1', tldScore: 100 };
    }
    if (cleanDomain.endsWith('.edu') || cleanDomain.includes('.edu.')) {
      return { tld: 'edu', category: 'University', trustTier: 'TIER_1', tldScore: 95 };
    }
    if (cleanDomain.endsWith('.ac.uk') || cleanDomain.includes('.ac.')) {
      return { tld: 'ac', category: 'University', trustTier: 'TIER_1', tldScore: 95 };
    }
    if (cleanDomain.endsWith('.int')) {
      return { tld: 'int', category: 'International Organization', trustTier: 'TIER_1', tldScore: 95 };
    }
    if (cleanDomain.endsWith('.org')) {
      return { tld: 'org', category: 'Commercial', trustTier: 'TIER_2', tldScore: 60 };
    }
    if (lastTld === 'com' || lastTld === 'co' || lastTld === 'net' || lastTld === 'io') {
      return { tld: lastTld, category: 'Commercial', trustTier: 'TIER_3', tldScore: 40 };
    }

    return { tld: lastTld || 'unknown', category: 'Unknown', trustTier: 'TIER_4', tldScore: 30 };
  }
}
