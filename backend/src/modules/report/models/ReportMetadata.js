import crypto from 'node:crypto';

export class ReportMetadata {
  constructor({
    reportId = null,
    reportVersion = '1.0.0',
    generatedAt = new Date().toISOString(),
    pipelineVersion = '1.0.0',
    templateVersion = '1.0.0',
    executionTimeMs = 0,
    checksum = ''
  } = {}) {
    this.reportId = reportId || `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    this.reportVersion = reportVersion;
    this.generatedAt = generatedAt;
    this.pipelineVersion = pipelineVersion;
    this.templateVersion = templateVersion;
    this.executionTimeMs = executionTimeMs;
    this.checksum = checksum;
  }

  toJSON() {
    return {
      reportId: this.reportId,
      reportVersion: this.reportVersion,
      generatedAt: this.generatedAt,
      pipelineVersion: this.pipelineVersion,
      templateVersion: this.templateVersion,
      executionTimeMs: this.executionTimeMs,
      checksum: this.checksum
    };
  }
}
