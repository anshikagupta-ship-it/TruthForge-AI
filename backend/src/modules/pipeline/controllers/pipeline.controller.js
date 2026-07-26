import { BaseController } from '../../../common/controllers/base.controller.js';
import { pipelineService } from '../services/pipeline.service.js';
import { FullPipelineService } from '../services/fullPipeline.service.js';

export class PipelineController extends BaseController {
  constructor() {
    super(pipelineService, 'PipelineRun');
  }

  async executeFullVerification(req, res, next) {
    try {
      let queryStr = '';
      let domain = 'Technology';
      let depth = 'Detailed';
      let max_sources = 20;

      if (typeof req.body === 'string') {
        try {
          const parsed = JSON.parse(req.body);

          queryStr = parsed.query || parsed.query_text || req.body;
          domain = parsed.domain || domain;
          depth = parsed.depth || depth;
          max_sources = parsed.max_sources || max_sources;
        } catch {
          queryStr = req.body;
        }
      } else if (req.body && typeof req.body === 'object') {
        queryStr =
          req.body.query ||
          req.body.query_text ||
          req.body.queryString ||
          '';

        domain = req.body.domain || domain;
        depth = req.body.depth || depth;
        max_sources = req.body.max_sources || max_sources;
      }

      if (!queryStr || queryStr.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message:
            'Query string is required. Pass a normal string or { query: "..." }.'
        });
      }

      console.log('[PipelineController] Starting verification...');
      console.log('[PipelineController] Query:', queryStr);

      const result = await FullPipelineService.executeFullVerification({
        query: queryStr.trim(),
        domain,
        depth,
        max_sources
      });

      console.log('[PipelineController] Verification completed successfully.');

      return res.status(200).json({
        success: true,
        message: 'Full verification pipeline completed successfully',
        data: result
      });
    } catch (err) {
      console.error('[PipelineController] Error:', err);

      return res.status(500).json({
        success: false,
        message: err.message || 'Verification pipeline error',
        stack:
          process.env.NODE_ENV !== 'production'
            ? err.stack
            : undefined
      });
    }
  }
}

export const pipelineController = new PipelineController();
