import { validatePayload, isUUID } from '../../../utils/validator.util.js';
import { BadRequestError } from '../../../utils/errors.js';

const STAGE_ENUM = [
  'initialized',
  'query_analyzed',
  'scraped',
  'normalized',
  'claim_verified',
  'source_evaluated',
  'lineage_tracked',
  'report_generated',
  'completed',
  'failed',
];

const STATUS_ENUM = ['pending', 'in_progress', 'completed', 'failed', 'cancelled'];

export const validateCreatePipelineRun = (req, res, next) => {
  try {
    validatePayload(req.body, {
      query_id: { required: false, isUUID: true },
      stage: { required: false, type: 'string', enum: STAGE_ENUM },
      status: { required: false, type: 'string', enum: STATUS_ENUM },
      error_message: { required: false, type: 'string' },
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUpdatePipelineRun = (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      throw new BadRequestError('Invalid pipeline run ID format');
    }
    validatePayload(req.body, {
      query_id: { required: false, isUUID: true },
      stage: { required: false, type: 'string', enum: STAGE_ENUM },
      status: { required: false, type: 'string', enum: STATUS_ENUM },
      error_message: { required: false, type: 'string' },
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const validatePipelineIdParam = (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      throw new BadRequestError('Invalid pipeline run ID format');
    }
    next();
  } catch (error) {
    next(error);
  }
};
