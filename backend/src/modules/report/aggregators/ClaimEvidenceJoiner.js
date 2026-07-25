import { ClaimReport } from '../models/ClaimReport.js';

export class ClaimEvidenceJoiner {
  /**
   * Joins verified claims with evidence, sources, lineage, and confidence scores.
   *
   * @param {Object} inputBatches
   * @returns {ClaimReport[]} Array of joined ClaimReport items
   */
  static joinClaims(inputBatches) {
    const {
      verificationBatch = {},
      confidenceBatch = {},
      evidenceBatch = {},
      sourceAuthenticityBatch = {},
      evidenceLineageBatch = {}
    } = inputBatches;

    const claimsList = verificationBatch.claims || verificationBatch.verifiedClaims || [];
    const confidenceMap = new Map((confidenceBatch.claims || []).map(c => [c.claimId, c]));
    const lineageMap = new Map((evidenceLineageBatch.claims || []).map(l => [l.claimId, l]));
    const sourceProfilesMap = new Map(
      (sourceAuthenticityBatch.profiles || sourceAuthenticityBatch.sources || []).map(s => [s.domain || s.sourceId, s])
    );
    const evidenceItemsMap = new Map(
      (evidenceBatch.items || evidenceBatch.evidence || []).map(e => [e.id || e.evidenceId, e])
    );

    return claimsList.map(vClaim => {
      const claimId = vClaim.claimId || vClaim.id;
      const confData = confidenceMap.get(claimId) || {};
      const linData = lineageMap.get(claimId) || {};

      // Extract supporting and contradicting evidence snippets
      const citedEvidenceIds = vClaim.evidenceIds || vClaim.citedEvidence || [];
      const supportingEvidence = [];
      const contradictingEvidence = [];

      citedEvidenceIds.forEach(evId => {
        const item = evidenceItemsMap.get(evId);
        const snippetText = item ? (item.text || item.snippet || item.content) : `Evidence ID ${evId}`;
        if (vClaim.verificationStatus === 'CONTRADICTED') {
          contradictingEvidence.push(snippetText);
        } else {
          supportingEvidence.push(snippetText);
        }
      });

      // Extract source domain authority profiles
      const sourceProfiles = [];
      if (vClaim.sources) {
        vClaim.sources.forEach(src => {
          const profile = sourceProfilesMap.get(src);
          if (profile) {
            sourceProfiles.push(`${profile.domain} (${profile.trustLevel || 'COMMERCIAL'}, Score: ${profile.authenticityScore ?? profile.score ?? 50})`);
          } else {
            sourceProfiles.push(src);
          }
        });
      }

      // Explanations array
      const explanation = confData.explanations || vClaim.explanation || [
        `Claim evaluated with verdict ${vClaim.verificationStatus || 'UNVERIFIABLE'}.`
      ];

      // Provenance path nodes
      const provenancePath = linData.provenancePath || linData.nodes || [claimId];

      return new ClaimReport({
        claimId,
        claim: vClaim.claim || vClaim.claimText || '',
        verificationStatus: vClaim.verificationStatus || 'UNVERIFIABLE',
        confidence: confData.score ?? confData.confidence ?? vClaim.confidence ?? 0,
        confidenceLevel: confData.confidenceLevel || 'MEDIUM',
        supportingEvidence,
        contradictingEvidence,
        sourceProfiles,
        explanation,
        provenancePath,
        penaltyCount: confData.appliedPenalties ? confData.appliedPenalties.length : 0
      });
    });
  }
}
