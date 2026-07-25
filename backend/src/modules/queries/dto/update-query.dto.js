export class UpdateQueryDto {
  constructor({ query_text, detected_domain, status }) {
    if (query_text !== undefined) this.query_text = query_text;
    if (detected_domain !== undefined) this.detected_domain = detected_domain;
    if (status !== undefined) this.status = status;
  }
}
