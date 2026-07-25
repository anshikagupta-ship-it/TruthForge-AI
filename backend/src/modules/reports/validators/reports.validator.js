import { validatePayload, isUUID } from '../../../utils/validator.util.js';
import { BadRequestError } from '../../../utils/errors.js';

const REPORT_STATUS_ENUM = ['pending', 'processing', 'completed', 'failed'];

export const validateCreateReport = (req, res, next) => {
  try {
    validatePayload(req.body, {
      query_id: { required: true, isUUID: true },
      executive_summary: { required: false, type: 'string' },
      overall_confidence: { required: false, type: 'number', min: 0.0, max: 1.0 },
      report_status: { required: false, type: 'string', enum: REPORT_STATUS_ENUM },
      status: { required: false, type: 'string', enum: REPORT_STATUS_ENUM },
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUpdateReport = (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      throw new BadRequestError('Invalid report ID format');
    }
    validatePayload(req.body, {
      query_id: { required: false, isUUID: true },
      executive_summary: { required: false, type: 'string' },
      overall_confidence: { required: false, type: 'number', min: 0.0, max: 1.0 },
      report_status: { required: false, type: 'string', enum: REPORT_STATUS_ENUM },
      status: { required: false, type: 'string', enum: REPORT_STATUS_ENUM },
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const validateReportIdParam = (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      throw new BadRequestError('Invalid report ID format');
    }
    next();
  } catch (error) {
    next(error);
  }
};
