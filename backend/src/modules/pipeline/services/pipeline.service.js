import { BaseService } from '../../../common/services/base.service.js';
import { pipelineRepository } from '../repositories/pipeline.repository.js';
import { CreatePipelineRunDto } from '../dto/create-pipeline-run.dto.js';
import { UpdatePipelineRunDto } from '../dto/update-pipeline-run.dto.js';

export class PipelineService extends BaseService {
  constructor() {
    super(pipelineRepository, 'PipelineRun');
  }

  async create(payload) {
    const dto = new CreatePipelineRunDto(payload);
    return super.create(dto);
  }

  async update(id, payload) {
    const dto = new UpdatePipelineRunDto(payload);
    return super.update(id, dto);
  }
}

export const pipelineService = new PipelineService();
