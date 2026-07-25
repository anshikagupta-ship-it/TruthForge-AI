import { ReportSection } from '../models/ReportSection.js';

export class LimitationsBuilder {
  static build(aggregatedData) {
    const claims = aggregatedData.claimReports || [];
    const rawBatches = aggregatedData.rawBatches || {};
    const linBatch = rawBatches.evidenceLineageBatch || {};

    const unavailableEvidence = [];
    const conflictingEvidence = [];
    const missingSources = [];
    const partialProvenance = [];
    const confidenceLimitations = [];

    claims.forEach(c => {
      if (c.verificationStatus === 'INSUFFICIENT_EVIDENCE' || c.verificationStatus === 'UNVERIFIABLE') {
        unavailableEvidence.push(`Claim "${c.claimId}" lacks sufficient retrieved evidence items.`);
      }
      if (c.contradictingEvidence && c.contradictingEvidence.length > 0) {
        conflictingEvidence.push(`Claim "${c.claimId}" exhibits conflicting evidence across sources.`);
      }
      if (c.penaltyCount > 0) {
        confidenceLimitations.push(`Claim "${c.claimId}" received ${c.penaltyCount} confidence penalty reduction(s).`);
      }
    });

    if (linBatch.brokenChains > 0) {
      partialProvenance.push(`${linBatch.brokenChains} claim provenance path(s) incomplete.`);
    }

    return new ReportSection({
      id: 'sec-9-limitations',
      title: 'System Limitations & Disclosures',
      order: 9,
      content: {
        unavailableEvidence,
        conflictingEvidence,
        missingSources,
        partialProvenance,
        confidenceLimitations,
        generalDisclaimer: 'This report reflects deterministic algorithmic synthesis based strictly on retrieved domain evidence. No unstated facts or probabilistic inferences were synthesized.'
      }
    });
  }
}
