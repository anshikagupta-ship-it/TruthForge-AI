export class UpdateReportDto {
  constructor({ query_id, executive_summary, overall_confidence, report_status, status }) {
    if (query_id !== undefined) this.query_id = query_id;
    if (executive_summary !== undefined) this.executive_summary = executive_summary;
    if (overall_confidence !== undefined) this.overall_confidence = overall_confidence;
    const st = report_status !== undefined ? report_status : status;
    if (st !== undefined) this.report_status = st;
  }
}
