/**
 * Evidence Resolver
 * Maps evidence IDs referenced in claims to ingested EvidenceBatch items and extracts source URLs
 */

export class EvidenceResolver {
  /**
   * @param {Object} evidenceBatch - EvidenceBatch object or raw evidence list
   */
  constructor(evidenceBatch = {}) {
    this.evidenceMap = new Map();
    const items = evidenceBatch.evidence || evidenceBatch.items || (Array.isArray(evidenceBatch) ? evidenceBatch : []);
    items.forEach((item) => {
      const id = item.evidenceId || item.id;
      if (id) {
        this.evidenceMap.set(String(id), {
          evidenceId: String(id),
          text: item.text || item.content || item.snippet || '',
          sourceUrl: item.sourceUrl || item.url || item.domain || 'unknown://source',
          sourceId: item.sourceId || item.source_id || null,
          relevance: typeof item.relevance === 'number' ? item.relevance : 1.0,
          metadata: item.metadata || {},
        });
      }
    });
  }

  /**
   * Get resolved evidence record by evidence ID
   * @param {string} evidenceId
   * @returns {Object|null}
   */
  resolveEvidence(evidenceId) {
    if (!evidenceId) return null;
    return this.evidenceMap.get(String(evidenceId)) || null;
  }

  /**
   * Resolve all evidence items linked to a given claim (supporting & contradicting)
   * @param {Object} claim - VerifiedClaim object from VerificationBatch
   * @returns {{ supporting: Object[], contradicting: Object[] }}
   */
  resolveClaimEvidence(claim) {
    const supportingIds = claim.supportingEvidenceIds || claim.supportingEvidence || [];
    const contradictingIds = claim.contradictingEvidenceIds || claim.contradictingEvidence || [];

    const supporting = supportingIds
      .map((id) => this.resolveEvidence(id))
      .filter(Boolean);

    const contradicting = contradictingIds
      .map((id) => this.resolveEvidence(id))
      .filter(Boolean);

    return { supporting, contradicting };
  }
}
