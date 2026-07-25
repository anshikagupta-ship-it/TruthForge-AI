import { ReportAggregator } from '../aggregators/ReportAggregator.js';
import { SectionBuilderFactory } from '../builders/SectionBuilderFactory.js';
import { TruthForgeReport } from '../models/TruthForgeReport.js';
import { ReportMetadata } from '../models/ReportMetadata.js';
import { ReportValidator } from '../validators/ReportValidator.js';
import { ExportManager } from '../exporters/ExportManager.js';
import { computeDeterministicHash } from '../utils/deterministicHasher.js';
import { logger } from '../../../utils/logger.js';

export class ReportGeneratorService {
  /**
   * Generates a complete multi-format ReportPackage from Phase 1-6 input batches.
   *
   * @param {import('../contracts/reportInput.contract.js').ReportInputBatches} inputBatches
   * @param {string[]} [targetFormats]
   * @returns {import('../contracts/reportPackage.contract.js').ReportPackage}
   */
  static generateReport(inputBatches, targetFormats = null) {
    const startTime = Date.now();

    // Layer 1: Ingest & aggregate inputs across phases
    const aggregatedData = ReportAggregator.aggregate(inputBatches);

    // Layer 2: Construct 10 deterministic sections
    const sections = SectionBuilderFactory.buildAllSections(aggregatedData);

    // Layer 3: Build Canonical Internal Report Model
    const draftReport = new TruthForgeReport({
      metadata: new ReportMetadata({
        reportId: aggregatedData.query.queryId ? `rep-${aggregatedData.query.queryId}` : undefined,
        generatedAt: aggregatedData.query.executionTimestamp || new Date().toISOString(),
        pipelineVersion: '1.0.0',
        executionTimeMs: 0
      }),
      executiveSummary: aggregatedData.executiveSummary,
      sections
    });

    // Layer 4: Validate Report Structural Integrity
    const validationResult = ReportValidator.validate(draftReport);
    if (!validationResult.valid) {
      logger.warn('[ReportGenerator] Validation warnings encountered', { errors: validationResult.errors });
    }

    // Calculate metadata checksum deterministically
    const reportDataForChecksum = draftReport.toJSON();
    delete reportDataForChecksum.metadata.executionTimeMs;
    delete reportDataForChecksum.metadata.checksum;

    draftReport.metadata.executionTimeMs = Date.now() - startTime;
    draftReport.metadata.checksum = computeDeterministicHash(reportDataForChecksum);

    // Layer 5-7: Formatting, Rendering, Export
    const reportPackage = ExportManager.exportReportPackage(draftReport, targetFormats);

    logger.info('[ReportGenerator] Report successfully generated', {
      reportId: draftReport.metadata.reportId,
      executionTimeMs: draftReport.metadata.executionTimeMs,
      renderedCount: reportPackage.renderedFiles.length,
      checksum: draftReport.metadata.checksum
    });

    return reportPackage;
  }
}
