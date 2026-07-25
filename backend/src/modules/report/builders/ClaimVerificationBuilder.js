import { ReportSection } from '../models/ReportSection.js';

export class ClaimVerificationBuilder {
  static build(aggregatedData) {
    const claims = aggregatedData.claimReports || [];
    return new ReportSection({
      id: 'sec-4-claim-verification',
      title: 'Claim Verification Results',
      order: 4,
      content: {
        totalClaimsEvaluated: claims.length,
        claims: claims.map(c => c.toJSON())
      }
    });
  }
}
