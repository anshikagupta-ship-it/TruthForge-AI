import { ReportSection } from '../models/ReportSection.js';

export class QueryContextBuilder {
  static build(aggregatedData) {
    const q = aggregatedData.query || {};
    return new ReportSection({
      id: 'sec-2-query-context',
      title: 'Query & Research Context',
      order: 2,
      content: {
        queryId: q.queryId || 'N/A',
        queryString: q.queryString || q.query || 'Unspecified Query',
        domainContext: q.domainContext || 'General Research',
        executionTimestamp: q.executionTimestamp || new Date().toISOString(),
        userMetadata: q.userMetadata || {}
      }
    });
  }
}
