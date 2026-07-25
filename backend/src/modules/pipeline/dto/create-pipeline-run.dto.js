export class CreatePipelineRunDto {
  constructor({ query_id, stage, status, metrics, error_message }) {
    if (query_id !== undefined) this.query_id = query_id;
    if (stage !== undefined) this.stage = stage;
    if (status !== undefined) this.status = status;
    if (metrics !== undefined) this.metrics = metrics;
    if (error_message !== undefined) this.error_message = error_message;
  }
}
