import { ReportSection } from '../models/ReportSection.js';

export class ExecutiveSummaryBuilder {
  static build(aggregatedData) {
    const summary = aggregatedData.executiveSummary;
    return new ReportSection({
      id: 'sec-1-executive-summary',
      title: 'Executive Summary',
      order: 1,
      content: {
        overallVerdict: summary.overallVerdict,
        overallConfidence: summary.overallConfidence,
        totalClaims: summary.verifiedClaims,
        supportedClaims: summary.supportedClaims,
        contradictedClaims: summary.contradictedClaims,
        insufficientClaims: summary.insufficientClaims,
        evidenceCount: summary.totalEvidenceItems,
        sourcesUsedCount: summary.uniqueSourcesUsed,
        highestAuthoritySources: summary.highestAuthoritySources
      }
    });
  }
}
