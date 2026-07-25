import { BaseController } from '../../../common/controllers/base.controller.js';
import { pipelineService } from '../services/pipeline.service.js';

export class PipelineController extends BaseController {
  constructor() {
    super(pipelineService, 'PipelineRun');
  }
}

export const pipelineController = new PipelineController();
