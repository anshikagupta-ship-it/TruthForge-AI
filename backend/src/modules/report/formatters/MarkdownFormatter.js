export class MarkdownFormatter {
  static format(report) {
    const reportData = report.toJSON ? report.toJSON() : report;
    return reportData;
  }
}
