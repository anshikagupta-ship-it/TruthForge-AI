import { ValidationError } from './errors.js';

/**
 * Validates whether a string is a valid UUID v4 / UUID format.
 * @param {string} str
 * @returns {boolean}
 */
export const isUUID = (str) => {
  if (typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Validates payload object against schema rules.
 * Throws ValidationError if any rule fails.
 * @param {object} payload
 * @param {object} schema
 */
export const validatePayload = (payload, schema) => {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    throw new ValidationError(['Request body must be a JSON object']);
  }

  Object.entries(schema).forEach(([field, rules]) => {
    const value = payload[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field '${field}' is required`);
      return;
    }

    if (value !== undefined && value !== null) {
      if (rules.type && typeof value !== rules.type) {
        errors.push(`Field '${field}' must be of type ${rules.type}`);
      }

      if (rules.enum && Array.isArray(rules.enum) && !rules.enum.includes(value)) {
        errors.push(`Field '${field}' must be one of: ${rules.enum.join(', ')}`);
      }

      if (rules.isUUID && !isUUID(value)) {
        errors.push(`Field '${field}' must be a valid UUID`);
      }

      if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
        errors.push(`Field '${field}' must be >= ${rules.min}`);
      }

      if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
        errors.push(`Field '${field}' must be <= ${rules.max}`);
      }

      if (rules.url && typeof value === 'string') {
        try {
          new URL(value);
        } catch {
          errors.push(`Field '${field}' must be a valid URL`);
        }
      }
    }
  });

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
};
