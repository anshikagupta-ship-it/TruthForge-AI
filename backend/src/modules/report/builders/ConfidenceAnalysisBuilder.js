import { ReportSection } from '../models/ReportSection.js';

export class ConfidenceAnalysisBuilder {
  static build(aggregatedData) {
    const claims = aggregatedData.claimReports || [];
    let totalScore = 0;
    let highestClaim = null;
    let lowestClaim = null;
    const distribution = { VERY_HIGH: 0, HIGH: 0, MEDIUM: 0, LOW: 0, VERY_LOW: 0 };
    let totalPenalties = 0;

    claims.forEach(c => {
      totalScore += c.confidence;
      if (!highestClaim || c.confidence > highestClaim.confidence) highestClaim = c;
      if (!lowestClaim || c.confidence < lowestClaim.confidence) lowestClaim = c;
      if (distribution[c.confidenceLevel] !== undefined) distribution[c.confidenceLevel]++;
      totalPenalties += c.penaltyCount;
    });

    const averageConfidence = claims.length > 0 ? Math.round(totalScore / claims.length) : 0;

    return new ReportSection({
      id: 'sec-5-confidence-analysis',
      title: 'Confidence Analysis & Penalties',
      order: 5,
      content: {
        averageConfidence,
        highestConfidenceClaim: highestClaim ? { claimId: highestClaim.claimId, score: highestClaim.confidence } : null,
        lowestConfidenceClaim: lowestClaim ? { claimId: lowestClaim.claimId, score: lowestClaim.confidence } : null,
        confidenceDistribution: distribution,
        totalPenaltiesApplied: totalPenalties
      }
    });
  }
}
