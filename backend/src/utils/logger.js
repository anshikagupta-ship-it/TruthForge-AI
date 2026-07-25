/**
 * Structured logger utility for TruthForge-AI backend
 */

export const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? meta : '');
  },

  warn: (message, meta = {}) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? meta : '');
  },

  error: (message, meta = {}) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? meta : '');
  },

  /**
   * Logs CRUD operations with entity name, operation type, and execution time.
   * @param {string} entity - Name of the domain entity (e.g., 'Queries')
   * @param {string} operation - Operation name (e.g., 'create', 'findById')
   * @param {number} executionTimeMs - Execution duration in milliseconds
   * @param {object} [meta] - Optional additional metadata
   */
  logCrud: (entity, operation, executionTimeMs, meta = {}) => {
    const timeFormatted = `${executionTimeMs.toFixed(2)}ms`;
    console.log(
      `[CRUD] [${new Date().toISOString()}] Entity: ${entity} | Operation: ${operation} | Execution Time: ${timeFormatted}`,
      Object.keys(meta).length ? meta : ''
    );
  },

  /**
   * Logs HTTP requests with method, url, status code, and response duration.
   * @param {string} method - HTTP Method (e.g., 'GET')
   * @param {string} url - Request URL
   * @param {number} status - HTTP Status Code
   * @param {number} durationMs - Request duration in milliseconds
   */
  logRequest: (method, url, status, durationMs) => {
    const timeFormatted = `${durationMs.toFixed(2)}ms`;
    console.log(
      `[HTTP] [${new Date().toISOString()}] Method: ${method} | URL: ${url} | Status: ${status} | Duration: ${timeFormatted}`
    );
  },
};
