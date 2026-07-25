/**
 * Feature Extractor Facade for Phase 6 Confidence Engine
 * Consumes raw input batches and extracts 13+ deterministic features
 */

import { MathUtils } from '../utils/mathUtils.js';

/**
 * @typedef {Object} ExtractedFeatures
 * @property {'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'CONTRADICTED' | 'INSUFFICIENT_EVIDENCE' | 'UNVERIFIABLE'} verificationStatus
 * @property {number} supportingCount
 * @property {number} contradictingCount
 * @property {number} avgSemanticScore
 * @property {number} avgRetrievalScore
 * @property {number} avgSourceAuthenticityScore
 * @property {number} evidenceDiversityScore
 * @property {number} sourceDiversityScore
 * @property {number} domainDiversityScore
 * @property {number} evidenceCoverageRatio
 * @property {number} provenanceCompletenessRatio
 * @property {number} evidenceAgreementRatio
 * @property {number} evidenceQualityScore
 * @property {number} unknownDomainCount
 */

export class FeatureExtractor {
  /**
   * Extract features for a single verified claim statement
   * @param {Object} claim
   * @param {Object} inputs
   * @returns {ExtractedFeatures}
   */
  static extractFeatures(claim = {}, inputs = {}) {
    const {
      EvidenceBatch = {},
      EvidenceProfile = {},
      SourceAuthenticityBatch = {},
      EvidenceLineageBatch = {},
    } = inputs;

    // 1. Verification Status
    const verificationStatus = claim.status || claim.verdict || 'UNVERIFIABLE';

    // 2. Supporting & Contradicting Counts
    const supportingEvidenceIds = Array.isArray(claim.supportingEvidenceIds) ? claim.supportingEvidenceIds : [];
    const contradictingEvidenceIds = Array.isArray(claim.contradictingEvidenceIds) ? claim.contradictingEvidenceIds : [];

    const supportingCount = supportingEvidenceIds.length;
    const contradictingCount = contradictingEvidenceIds.length;
    const totalEvidenceCount = supportingCount + contradictingCount;

    // Map evidence objects
    const evidenceList = Array.isArray(EvidenceBatch.evidence) ? EvidenceBatch.evidence : [];
    const evidenceMap = new Map(evidenceList.map((e) => [e.evidenceId || e.id, e]));

    // 3. Average Semantic & Retrieval Scores
    const semanticScores = [];
    const retrievalScores = [];
    const sourceUrls = new Set();
    const domains = new Set();

    for (const eid of [...supportingEvidenceIds, ...contradictingEvidenceIds]) {
      const item = evidenceMap.get(eid);
      if (item) {
        if (typeof item.retrievalScore === 'number') {
          retrievalScores.push(item.retrievalScore);
        }
        if (item.sourceUrl) {
          sourceUrls.add(item.sourceUrl);
          try {
            const urlObj = new URL(item.sourceUrl.startsWith('http') ? item.sourceUrl : `https://${item.sourceUrl}`);
            const host = urlObj.hostname.replace(/^www\./, '').toLowerCase();
            domains.add(host);
          } catch {
            // Safe fallback
          }
        }
      }

      // Check EvidenceProfile metadata map if provided
      const profile = EvidenceProfile[eid] || EvidenceProfile[claim.claimId];
      if (profile && typeof profile.semanticScore === 'number') {
        semanticScores.push(profile.semanticScore);
      }
    }

    const avgSemanticScore = MathUtils.safeAverage(semanticScores, 75);
    const avgRetrievalScore = MathUtils.safeAverage(retrievalScores, 70);

    // 4. Source Authenticity Scores & Unknown Domains
    const profilesList = Array.isArray(SourceAuthenticityBatch.profiles) ? SourceAuthenticityBatch.profiles : [];
    const authenticityMap = new Map(profilesList.map((p) => [p.domain || p.sourceUrl, p]));

    const authScores = [];
    let unknownDomainCount = 0;

    for (const domain of domains) {
      const authProfile = authenticityMap.get(domain);
      if (authProfile && typeof authProfile.authenticityScore === 'number') {
        authScores.push(authProfile.authenticityScore);
        if (authProfile.authenticityLevel === 'UNKNOWN' || authProfile.sourceType === 'Unknown') {
          unknownDomainCount++;
        }
      } else {
        authScores.push(30); // Default score for unprofiled domain
        unknownDomainCount++;
      }
    }

    const avgSourceAuthenticityScore = MathUtils.safeAverage(authScores, 50);

    // 5. Diversity Scores
    const domainDiversityScore = totalEvidenceCount > 0
      ? Math.min(1.0, MathUtils.safeRatio(domains.size, totalEvidenceCount, 1.0))
      : 1.0;

    const sourceDiversityScore = totalEvidenceCount > 0
      ? Math.min(1.0, MathUtils.safeRatio(sourceUrls.size, totalEvidenceCount, 1.0))
      : 1.0;

    const evidenceDiversityScore = (domainDiversityScore + sourceDiversityScore) / 2;

    // 6. Evidence Agreement Ratio
    const evidenceAgreementRatio = totalEvidenceCount > 0
      ? MathUtils.safeRatio(supportingCount, totalEvidenceCount, 0)
      : (verificationStatus === 'SUPPORTED' ? 1.0 : 0);

    // 7. Evidence Coverage Ratio
    const evidenceCoverageRatio = typeof claim.coverageRatio === 'number'
      ? claim.coverageRatio
      : (supportingCount > 0 ? Math.min(1.0, supportingCount / 3) : 0);

    // 8. Provenance Completeness Ratio (Phase 5 Lineage)
    let provenanceCompletenessRatio = 1.0;
    if (EvidenceLineageBatch && Array.isArray(EvidenceLineageBatch.claimLineages)) {
      const claimLineage = EvidenceLineageBatch.claimLineages.find((l) => l.claimId === claim.claimId);
      if (!claimLineage) {
        provenanceCompletenessRatio = 0.5; // Missing lineage record
      } else if (claimLineage.missingProfileCount && claimLineage.missingProfileCount > 0) {
        provenanceCompletenessRatio = 0.75;
      }
    } else if (EvidenceLineageBatch && EvidenceLineageBatch.status === 'INCOMPLETE') {
      provenanceCompletenessRatio = 0.25;
    }

    // 9. Evidence Quality Score
    const evidenceQualityScore = MathUtils.clamp(
      (avgSemanticScore * 0.5) + (avgRetrievalScore * 0.3) + (avgSourceAuthenticityScore * 0.2)
    );

    return {
      verificationStatus,
      supportingCount,
      contradictingCount,
      avgSemanticScore,
      avgRetrievalScore,
      avgSourceAuthenticityScore,
      evidenceDiversityScore,
      sourceDiversityScore,
      domainDiversityScore,
      evidenceCoverageRatio,
      provenanceCompletenessRatio,
      evidenceAgreementRatio,
      evidenceQualityScore,
      unknownDomainCount,
    };
  }
}
