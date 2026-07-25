export class TextFormatter {
  static format(report) {
    return report.toJSON ? report.toJSON() : report;
  }
}
