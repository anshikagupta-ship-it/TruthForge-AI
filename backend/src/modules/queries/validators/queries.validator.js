import { validatePayload, isUUID } from '../../../utils/validator.util.js';
import { BadRequestError } from '../../../utils/errors.js';

const STATUS_ENUM = ['pending', 'processing', 'completed', 'failed'];

export const validateCreateQuery = (req, res, next) => {
  try {
    validatePayload(req.body, {
      query_text: { required: true, type: 'string' },
      detected_domain: { required: false, type: 'string' },
      status: { required: false, type: 'string', enum: STATUS_ENUM },
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUpdateQuery = (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      throw new BadRequestError('Invalid query ID format');
    }
    validatePayload(req.body, {
      query_text: { required: false, type: 'string' },
      detected_domain: { required: false, type: 'string' },
      status: { required: false, type: 'string', enum: STATUS_ENUM },
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const validateQueryIdParam = (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      throw new BadRequestError('Invalid query ID format');
    }
    next();
  } catch (error) {
    next(error);
  }
};
