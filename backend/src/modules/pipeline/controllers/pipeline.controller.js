import { BaseController } from '../../../common/controllers/base.controller.js';
import { pipelineService } from '../services/pipeline.service.js';
import { FullPipelineService } from '../services/fullPipeline.service.js';
import { sendSuccess } from '../../../utils/response.js';

export class PipelineController extends BaseController {
  constructor() {
    super(pipelineService, 'PipelineRun');
  }

  async executeFullVerification(req, res, next) {
    try {
      const { query, domain, depth, max_sources } = req.body;
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Field "query" is required'
        });
      }

      const result = await FullPipelineService.executeFullVerification({
        query: query.trim(),
        domain,
        depth,
        max_sources
      });

      return sendSuccess(res, result, 'Full verification pipeline completed successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}

export const pipelineController = new PipelineController();

