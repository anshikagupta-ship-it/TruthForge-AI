import { validatePayload, isUUID } from '../../../utils/validator.util.js';
import { BadRequestError } from '../../../utils/errors.js';

const VERIFICATION_STATUS_ENUM = [
  'verified',
  'partially_verified',
  'conflicting',
  'insufficient_evidence',
  'opinion',
];

export const validateCreateClaim = (req, res, next) => {
  try {
    validatePayload(req.body, {
      report_id: { required: true, isUUID: true },
      claim_text: { required: true, type: 'string' },
      confidence_score: { required: false, type: 'number', min: 0.0, max: 1.0 },
      confidence: { required: false, type: 'number', min: 0.0, max: 1.0 },
      verification_status: { required: false, type: 'string', enum: VERIFICATION_STATUS_ENUM },
      explanation: { required: false, type: 'string' },
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUpdateClaim = (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      throw new BadRequestError('Invalid claim ID format');
    }
    validatePayload(req.body, {
      report_id: { required: false, isUUID: true },
      claim_text: { required: false, type: 'string' },
      confidence_score: { required: false, type: 'number', min: 0.0, max: 1.0 },
      confidence: { required: false, type: 'number', min: 0.0, max: 1.0 },
      verification_status: { required: false, type: 'string', enum: VERIFICATION_STATUS_ENUM },
      explanation: { required: false, type: 'string' },
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const validateClaimIdParam = (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      throw new BadRequestError('Invalid claim ID format');
    }
    next();
  } catch (error) {
    next(error);
  }
};
