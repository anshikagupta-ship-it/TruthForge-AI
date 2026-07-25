import { ReportSection } from '../models/ReportSection.js';

export class AppendixBuilder {
  static build(aggregatedData) {
    return new ReportSection({
      id: 'sec-10-appendix',
      title: 'Appendix & Execution Audit Trail',
      order: 10,
      content: {
        pipelineVersion: '1.0.0',
        reportEngineVersion: '1.0.0',
        templateVersion: '1.0.0',
        schemaReference: 'https://schema.truthforge.ai/v1/report.json',
        executionEnvironment: 'Node.js/Express ESM Core Engine',
        checksumAlgorithm: 'SHA-256'
      }
    });
  }
}
