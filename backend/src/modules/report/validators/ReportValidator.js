import { SectionIntegrityValidator } from './SectionIntegrityValidator.js';
import { ReferenceValidator } from './ReferenceValidator.js';
import { MetadataValidator } from './MetadataValidator.js';

export class ReportValidator {
  /**
   * Performs complete structural, reference, and metadata validation.
   *
   * @param {import('../models/TruthForgeReport.js').TruthForgeReport} report
   * @returns {{ valid: boolean, errors: string[] }}
   */
  static validate(report) {
    if (!report) {
      return { valid: false, errors: ['ERR_EMPTY_REPORT: Report object is null or undefined'] };
    }

    const errors = [
      ...SectionIntegrityValidator.validate(report),
      ...ReferenceValidator.validate(report),
      ...MetadataValidator.validate(report)
    ];

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
