import { validatePayload, isUUID } from '../../../utils/validator.util.js';
import { BadRequestError } from '../../../utils/errors.js';

const SOURCE_TYPE_ENUM = [
  'journal',
  'government',
  'research',
  'documentation',
  'news',
  'standards',
  'official',
];

export const validateCreateSource = (req, res, next) => {
  try {
    validatePayload(req.body, {
      source_name: { required: true, type: 'string' },
      source_url: { required: true, url: true },
      publisher: { required: false, type: 'string' },
      source_type: { required: true, type: 'string', enum: SOURCE_TYPE_ENUM },
      trust_score: { required: false, type: 'number', min: 0.0, max: 1.0 },
      doi: { required: false, type: 'string' },
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUpdateSource = (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      throw new BadRequestError('Invalid source ID format');
    }
    validatePayload(req.body, {
      source_name: { required: false, type: 'string' },
      source_url: { required: false, url: true },
      publisher: { required: false, type: 'string' },
      source_type: { required: false, type: 'string', enum: SOURCE_TYPE_ENUM },
      trust_score: { required: false, type: 'number', min: 0.0, max: 1.0 },
      doi: { required: false, type: 'string' },
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const validateSourceIdParam = (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      throw new BadRequestError('Invalid source ID format');
    }
    next();
  } catch (error) {
    next(error);
  }
};
