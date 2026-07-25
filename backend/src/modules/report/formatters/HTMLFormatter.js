export class HTMLFormatter {
  static format(report) {
    return report.toJSON ? report.toJSON() : report;
  }
}
