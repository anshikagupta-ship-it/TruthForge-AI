export class PDFFormatter {
  static format(report) {
    return report.toJSON ? report.toJSON() : report;
  }
}
