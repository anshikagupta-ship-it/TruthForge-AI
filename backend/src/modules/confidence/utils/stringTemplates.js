/**
 * String templates for deterministic NLG explanation generation
 */

export class StringTemplates {
  /**
   * Replace {{variable}} placeholders in template string
   * @param {string} template
   * @param {Record<string, string | number>} params
   * @returns {string}
   */
  static render(template, params = {}) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return params[key] !== undefined ? String(params[key]) : '';
    });
  }

  static get Strengths() {
    return {
      HIGH_AUTHORITY_SOURCES: 'Supported by high-authority institutional sources.',
      MULTIPLE_INDEPENDENT_SOURCES: 'Supported by {{count}} independent evidence sources.',
      COMPLETE_LINEAGE: 'Complete lineage graph with verified cryptographic provenance.',
      HIGH_CONSENSUS: 'High degree of agreement among independent sources.',
      STRONG_RETRIEVAL: 'High semantic relevance score across retrieved evidence snippets.',
    };
  }

  static get Penalties() {
    return {
      CONTRADICTING_EVIDENCE: 'Confidence reduced by {{count}} conflicting evidence source(s).',
      LOW_SOURCE_DIVERSITY: 'Low source diversity; evidence relies heavily on a single domain.',
      INCOMPLETE_LINEAGE: 'Incomplete provenance lineage graph detected.',
      WEAK_RETRIEVAL: 'Low semantic relevance score from retrieval phase.',
      UNKNOWN_SOURCES: 'Evidence includes unverified or unknown domain sources.',
      MISSING_EVIDENCE: 'Claim lacks direct supporting evidence snippets.',
    };
  }

  static get SummaryReasons() {
    return {
      VERY_HIGH_CONFIDENCE: 'Very high confidence due to strong institutional source consensus and complete provenance.',
      HIGH_CONFIDENCE: 'High confidence due to reliable source consensus and solid evidence coverage.',
      MEDIUM_CONFIDENCE: 'Moderate confidence due to partial evidence coverage or single-domain reliance.',
      LOW_CONFIDENCE: 'Low confidence due to conflicting evidence or weak retrieval scores.',
      VERY_LOW_CONFIDENCE: 'Very low confidence due to missing provenance, unverified sources, or unverified verdict.',
    };
  }
}
