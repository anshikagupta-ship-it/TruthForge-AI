import { ReportSection } from '../models/ReportSection.js';

export class OverallVerdictBuilder {
  static build(aggregatedData) {
    const summary = aggregatedData.executiveSummary;
    return new ReportSection({
      id: 'sec-3-overall-verdict',
      title: 'Overall Pipeline Verdict',
      order: 3,
      content: {
        verdict: summary.overallVerdict,
        confidence: summary.overallConfidence,
        verdictBreakdown: {
          supportedPercentage: summary.verifiedClaims > 0 ? Math.round((summary.supportedClaims / summary.verifiedClaims) * 100) : 0,
          contradictedPercentage: summary.verifiedClaims > 0 ? Math.round((summary.contradictedClaims / summary.verifiedClaims) * 100) : 0,
          insufficientPercentage: summary.verifiedClaims > 0 ? Math.round((summary.insufficientClaims / summary.verifiedClaims) * 100) : 0
        }
      }
    });
  }
}
