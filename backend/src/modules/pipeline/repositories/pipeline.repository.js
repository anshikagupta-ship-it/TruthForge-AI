import { BaseRepository } from '../../../common/repositories/base.repository.js';

export class PipelineRepository extends BaseRepository {
  constructor() {
    super(
      'pipeline_runs',
      ['stage', 'error_message'],
      ['status', 'stage', 'query_id']
    );
  }
}

export const pipelineRepository = new PipelineRepository();
