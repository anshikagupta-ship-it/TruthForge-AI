import { ReportSection } from '../models/ReportSection.js';

export class SourceAuthenticityBuilder {
  static build(aggregatedData) {
    const rawBatches = aggregatedData.rawBatches || {};
    const srcBatch = rawBatches.sourceAuthenticityBatch || {};
    const profiles = srcBatch.profiles || srcBatch.sources || [];

    let totalScore = 0;
    const tldDist = {};
    const highAuth = [];

    profiles.forEach(p => {
      const score = p.authenticityScore ?? p.score ?? 50;
      totalScore += score;
      const tld = p.tld || (p.domain ? p.domain.split('.').pop() : 'unknown');
      tldDist[tld] = (tldDist[tld] || 0) + 1;
      if (p.trustLevel === 'GOVERNMENT' || p.trustLevel === 'ACADEMIC' || p.trustLevel === 'MEDICAL') {
        highAuth.push(p.domain);
      }
    });

    const averageAuthenticity = profiles.length > 0 ? Math.round(totalScore / profiles.length) : 0;

    return new ReportSection({
      id: 'sec-7-source-authenticity',
      title: 'Source Authenticity & Domain Trust',
      order: 7,
      content: {
        sourceCount: profiles.length,
        averageAuthenticity,
        highestAuthoritySources: Array.from(new Set(highAuth)),
        domainDistribution: tldDist,
        sourceProfiles: profiles.map(p => ({
          domain: p.domain,
          trustLevel: p.trustLevel || 'COMMERCIAL',
          score: p.authenticityScore ?? p.score ?? 50
        }))
      }
    });
  }
}
