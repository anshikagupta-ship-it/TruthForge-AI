export class CreateQueryDto {
  constructor({ query_text, detected_domain, status }) {
    this.query_text = query_text;
    if (detected_domain) this.detected_domain = detected_domain;
    if (status) this.status = status;
  }
}
