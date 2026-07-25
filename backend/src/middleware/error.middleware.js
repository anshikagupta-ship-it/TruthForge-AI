import { logger } from '../utils/logger.js';

export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Handle Supabase/PostgreSQL known error codes
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        statusCode = 409;
        message = err.detail || 'Resource already exists';
        break;
      case '23503': // foreign_key_violation
        statusCode = 400;
        message = err.detail || 'Referenced entity does not exist';
        break;
      case '22P02': // invalid_text_representation (e.g. invalid UUID format)
        statusCode = 400;
        message = 'Invalid input format or invalid UUID parameter';
        break;
      case 'PGRST116': // Supabase single row not found
        statusCode = 404;
        message = 'Resource not found';
        break;
      default:
        if (statusCode === 500 && err.message) {
          message = err.message;
        }
    }
  }

  logger.error(`Error processing request [${req.method} ${req.originalUrl}]: ${message}`, {
    statusCode,
    errors,
    stack: err.stack,
  });

  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  });
};
