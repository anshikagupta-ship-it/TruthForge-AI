import { ExecutiveSummary } from '../models/ExecutiveSummary.js';

export class MetricsAggregator {
  /**
   * Computes aggregate macro metrics for Executive Summary.
   *
   * @param {import('../models/ClaimReport.js').ClaimReport[]} claimReports
   * @param {Object} inputBatches
   * @returns {ExecutiveSummary}
   */
  static computeExecutiveSummary(claimReports, inputBatches) {
    const totalClaims = claimReports.length;
    let supported = 0;
    let contradicted = 0;
    let insufficient = 0;
    let totalConfidenceScore = 0;

    claimReports.forEach(c => {
      totalConfidenceScore += c.confidence;
      if (c.verificationStatus === 'SUPPORTED' || c.verificationStatus === 'PARTIALLY_SUPPORTED') {
        supported++;
      } else if (c.verificationStatus === 'CONTRADICTED') {
        contradicted++;
      } else {
        insufficient++;
      }
    });

    const avgConfidence = totalClaims > 0 ? Math.round(totalConfidenceScore / totalClaims) : 0;

    let overallVerdict = 'INSUFFICIENT_EVIDENCE';
    if (totalClaims > 0) {
      if (supported === totalClaims) overallVerdict = 'FULLY_SUPPORTED';
      else if (contradicted > 0) overallVerdict = 'CONTRADICTED';
      else if (supported > 0) overallVerdict = 'PARTIALLY_SUPPORTED';
      else overallVerdict = 'INSUFFICIENT_EVIDENCE';
    }

    const { evidenceBatch = {}, sourceAuthenticityBatch = {} } = inputBatches;
    const evidenceItems = evidenceBatch.items || evidenceBatch.evidence || [];
    const sourcesList = sourceAuthenticityBatch.profiles || sourceAuthenticityBatch.sources || [];

    const uniqueSources = new Set(sourcesList.map(s => s.domain || s.sourceId)).size;
    const highestAuthoritySources = sourcesList
      .filter(s => (s.trustLevel === 'GOVERNMENT' || s.trustLevel === 'ACADEMIC' || s.trustLevel === 'MEDICAL'))
      .map(s => s.domain);

    return new ExecutiveSummary({
      overallVerdict,
      overallConfidence: avgConfidence,
      verifiedClaims: totalClaims,
      supportedClaims: supported,
      contradictedClaims: contradicted,
      insufficientClaims: insufficient,
      totalEvidenceItems: evidenceItems.length,
      uniqueSourcesUsed: uniqueSources,
      highestAuthoritySources: Array.from(new Set(highestAuthoritySources))
    });
  }
}
