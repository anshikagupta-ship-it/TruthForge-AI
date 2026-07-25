import { ClaimEvidenceJoiner } from './ClaimEvidenceJoiner.js';
import { MetricsAggregator } from './MetricsAggregator.js';

export class ReportAggregator {
  /**
   * Master aggregator joining all Phase 1-6 input batches.
   *
   * @param {Object} inputBatches
   * @returns {Object} Unified aggregated data context
   */
  static aggregate(inputBatches) {
    const claimReports = ClaimEvidenceJoiner.joinClaims(inputBatches);
    const executiveSummary = MetricsAggregator.computeExecutiveSummary(claimReports, inputBatches);

    return {
      query: inputBatches.query || { queryId: 'qry-default', queryString: 'Research Query' },
      claimReports,
      executiveSummary,
      rawBatches: inputBatches
    };
  }
}
