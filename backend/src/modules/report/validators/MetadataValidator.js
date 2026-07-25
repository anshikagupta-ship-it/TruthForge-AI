export class MetadataValidator {
  static validate(report) {
    const errors = [];
    const meta = report.metadata || {};

    if (!meta.reportId) errors.push('ERR_MISSING_METADATA: reportId is blank');
    if (!meta.generatedAt) errors.push('ERR_MISSING_METADATA: generatedAt is blank');
    if (!meta.pipelineVersion) errors.push('ERR_MISSING_METADATA: pipelineVersion is blank');

    return errors;
  }
}
