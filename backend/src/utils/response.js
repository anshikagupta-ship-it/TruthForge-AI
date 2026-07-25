/**
 * Standardized API response utilities for TruthForge-AI
 */

/**
 * Sends a standardized success HTTP response.
 * @param {import('express').Response} res
 * @param {any} data
 * @param {string} message
 * @param {number} statusCode
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data !== null ? data : {},
  });
};

/**
 * Sends a standardized error HTTP response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {Array} errors
 * @param {number} statusCode
 */
export const sendError = (res, message = 'Error', errors = [], statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  });
};
