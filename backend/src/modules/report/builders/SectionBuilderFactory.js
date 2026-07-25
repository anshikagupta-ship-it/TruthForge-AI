import { ExecutiveSummaryBuilder } from './ExecutiveSummaryBuilder.js';
import { QueryContextBuilder } from './QueryContextBuilder.js';
import { OverallVerdictBuilder } from './OverallVerdictBuilder.js';
import { ClaimVerificationBuilder } from './ClaimVerificationBuilder.js';
import { ConfidenceAnalysisBuilder } from './ConfidenceAnalysisBuilder.js';
import { EvidenceSummaryBuilder } from './EvidenceSummaryBuilder.js';
import { SourceAuthenticityBuilder } from './SourceAuthenticityBuilder.js';
import { ProvenanceSummaryBuilder } from './ProvenanceSummaryBuilder.js';
import { LimitationsBuilder } from './LimitationsBuilder.js';
import { AppendixBuilder } from './AppendixBuilder.js';

export class SectionBuilderFactory {
  static builders = [
    ExecutiveSummaryBuilder,
    QueryContextBuilder,
    OverallVerdictBuilder,
    ClaimVerificationBuilder,
    ConfidenceAnalysisBuilder,
    EvidenceSummaryBuilder,
    SourceAuthenticityBuilder,
    ProvenanceSummaryBuilder,
    LimitationsBuilder,
    AppendixBuilder
  ];

  /**
   * Executes all 10 section builders sequentially.
   *
   * @param {Object} aggregatedData
   * @returns {import('../models/ReportSection.js').ReportSection[]}
   */
  static buildAllSections(aggregatedData) {
    return SectionBuilderFactory.builders.map(builder => builder.build(aggregatedData));
  }
}
