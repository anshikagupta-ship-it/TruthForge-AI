import { ReportSection } from '../models/ReportSection.js';

export class EvidenceSummaryBuilder {
  static build(aggregatedData) {
    const rawBatches = aggregatedData.rawBatches || {};
    const evBatch = rawBatches.evidenceBatch || {};
    const evProfile = rawBatches.evidenceProfile || {};
    const items = evBatch.items || evBatch.evidence || [];

    let totalQuality = 0;
    items.forEach(item => {
      totalQuality += item.qualityScore ?? item.score ?? 75;
    });

    const averageQuality = items.length > 0 ? Math.round(totalQuality / items.length) : 0;

    return new ReportSection({
      id: 'sec-6-evidence-summary',
      title: 'Evidence Summary & Coverage',
      order: 6,
      content: {
        evidenceCount: items.length,
        averageEvidenceQuality: averageQuality,
        coverageRatio: evProfile.coverageRatio ?? 0.85,
        evidenceDiversityScore: evProfile.diversityScore ?? 0.90,
        duplicateCount: evProfile.duplicateCount ?? 0,
        missingEvidenceFlags: evProfile.missingFlags || []
      }
    });
  }
}
