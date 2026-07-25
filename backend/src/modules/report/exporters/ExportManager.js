import formatsConfig from '../config/formats.json' with { type: 'json' };
import { FormatterFactory } from '../formatters/FormatterFactory.js';
import { RendererFactory } from '../renderers/RendererFactory.js';
import { computeDeterministicHash } from '../utils/deterministicHasher.js';
import { ZipExporter } from './ZipExporter.js';

export class ExportManager {
  /**
   * Generates requested output format files from canonical TruthForgeReport.
   *
   * @param {import('../models/TruthForgeReport.js').TruthForgeReport} report
   * @param {string[]} [targetFormats]
   * @returns {import('../contracts/reportPackage.contract.js').ReportPackage}
   */
  static exportReportPackage(report, targetFormats = null) {
    const formatsToRender = targetFormats || formatsConfig.defaultFormats || ['json', 'markdown', 'html', 'pdf', 'text'];
    const renderedFiles = [];

    formatsToRender.forEach(formatKey => {
      const fmtConfig = formatsConfig.formats[formatKey];
      if (!fmtConfig) return;

      const formatter = FormatterFactory.getFormatter(formatKey);
      const renderer = RendererFactory.getRenderer(formatKey);

      const formattedData = formatter.format(report);
      const renderedContent = renderer.render(formattedData);
      const checksum = computeDeterministicHash(renderedContent);

      renderedFiles.push({
        format: formatKey,
        filename: `report${fmtConfig.extension}`,
        mimeType: fmtConfig.mimeType,
        content: renderedContent,
        checksum
      });
    });

    const archiveBundle = ZipExporter.bundle(renderedFiles, report.metadata);

    return {
      report,
      renderedFiles,
      metadata: archiveBundle.manifest
    };
  }
}
