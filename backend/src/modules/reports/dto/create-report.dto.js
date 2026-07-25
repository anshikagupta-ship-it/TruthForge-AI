export class CreateReportDto {
  constructor({ query_id, executive_summary, overall_confidence, report_status, status }) {
    this.query_id = query_id;
    if (executive_summary !== undefined) this.executive_summary = executive_summary;
    if (overall_confidence !== undefined) this.overall_confidence = overall_confidence;
    this.report_status = report_status || status || 'pending';
  }
}
