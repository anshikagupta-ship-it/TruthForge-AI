import { BaseController } from '../../../common/controllers/base.controller.js';
import { pipelineService } from '../services/pipeline.service.js';
import { FullPipelineService } from '../services/fullPipeline.service.js';

export class PipelineController extends BaseController {
  constructor() {
    super(pipelineService, 'PipelineRun');
  }

  async executeFullVerification(req, res, next) {
    let keepAlive = null;
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
        } catch (e) {
          queryStr = req.body;
        }
      } else if (req.body && typeof req.body === 'object') {
        queryStr = req.body.query || req.body.query_text || req.body.queryString || '';
        domain = req.body.domain || domain;
        depth = req.body.depth || depth;
        max_sources = req.body.max_sources || max_sources;
      }

      if (!queryStr || typeof queryStr !== 'string' || queryStr.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Query string is required. Pass a normal string or { query: "..." }.'
        });
      }

      // --- THE WHITESPACE HEARTBEAT HACK ---


      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.flushHeaders(); // Send the headers immediately so Render knows we are alive


      req.on('close', () => {
        if (keepAlive) {
          clearInterval(keepAlive);
          keepAlive = null;
        }
        console.log('[PipelineController] Client disconnected. Heartbeat stopped.');
      });

      try {
        const result = await FullPipelineService.executeFullVerification({
          query: queryStr.trim(),
          domain,
          depth,
          max_sources
        });

        // 3. Stop the heartbeat when the heavy lifting is done
        if (keepAlive) {
          clearInterval(keepAlive);
          keepAlive = null;
        }

        // 4. Send the actual final JSON payload and close the connection
        res.write(JSON.stringify({
          success: true,
          message: 'Full verification pipeline completed successfully',
          data: result
        }));
        res.end();

      } catch (err) {
        // Handle failure cleanly while streaming
        if (keepAlive) {
          clearInterval(keepAlive);
          keepAlive = null;
        }
        res.write(JSON.stringify({
          success: false,
          message: err.message || 'Verification pipeline error'
        }));
        res.end();
      }

    } catch (err) {
      next(err);
    }
  }
}

export const pipelineController = new PipelineController();
