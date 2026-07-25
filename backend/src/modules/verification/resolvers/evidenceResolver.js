/**
 * Evidence Resolver
 * Resolves supporting evidence IDs into clean, compact Evidence Objects
 */

export class EvidenceResolver {
  /**
   * Resolves target evidence items for a specific claim from an EvidenceBatch
   * @param {Object} evidenceBatch - Full input EvidenceBatch object
   * @param {string[]} targetEvidenceIds - supportingEvidenceIds listed on the claim
   * @param {Object} [options]
   * @param {number} [options.maxSnippetLength=1000] - Character limit per evidence snippet
   * @returns {Array<{evidenceId: string, contentSnippet: string, sourceUrl: string, domain: string, retrievalScore: number}>}
   */
  static resolve(evidenceBatch, targetEvidenceIds = [], options = {}) {
    const maxSnippetLength = options.maxSnippetLength || 1000;
    const evidences = evidenceBatch?.evidences || evidenceBatch || [];

    if (!Array.isArray(evidences) || evidences.length === 0) {
      return [];
    }

    const targetSet = new Set(Array.isArray(targetEvidenceIds) ? targetEvidenceIds : []);

    // 1. Filter evidences matching target IDs or fallback to top scored if no IDs provided
    let matchedEvidences = [];
    if (targetSet.size > 0) {
      matchedEvidences = evidences.filter(e => {
        const id = e.evidenceId || e.id;
        return targetSet.has(id);
      });
    }

    // If target matching yields nothing, fallback to available evidence in batch (up to 5 items)
    if (matchedEvidences.length === 0) {
      matchedEvidences = evidences.slice(0, 5);
    }

    // 2. Map and clean evidence objects to include only necessary fields
    return matchedEvidences.map(item => {
      const id = item.evidenceId || item.id || 'ev-unknown';
      const rawContent = item.contentSnippet || item.content || item.text || '';
      
      // Sanitize string (remove extra whitespace/newlines)
      let cleanedSnippet = rawContent
        .replace(/<[^>]*>?/gm, '') // Strip basic HTML tags
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanedSnippet.length > maxSnippetLength) {
        cleanedSnippet = cleanedSnippet.substring(0, maxSnippetLength) + '... [truncated]';
      }

      let domain = item.domain || item.sourceDomain || '';
      if (!domain && item.sourceUrl) {
        try {
          domain = new URL(item.sourceUrl).hostname.replace(/^www\./, '');
        } catch {
          domain = 'unknown';
        }
      }
      if (!domain) domain = 'unknown';

      return {
        evidenceId: id,
        contentSnippet: cleanedSnippet,
        sourceUrl: item.sourceUrl || item.url || 'N/A',
        domain,
        retrievalScore: typeof item.retrievalScore === 'number' ? item.retrievalScore : (item.score || 1.0),
      };
    });
  }
}
