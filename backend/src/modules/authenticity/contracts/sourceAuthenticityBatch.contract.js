/**
 * Source Authenticity Batch Contract
 * JSDoc Type Definition for SourceAuthenticityBatch
 *
 * @typedef {Object} BatchExecutionSummary
 * @property {number} totalExecutionTimeMs - Total batch processing latency in milliseconds
 * @property {number} cacheHitRatio - Ratio of profiles served from cache (0.0 - 1.0)
 * @property {number} failedEvaluations - Number of fallback/malformed source profiles
 *
 * @typedef {Object} SourceAuthenticityBatch
 * @property {string} batchId - Unique ID for the evaluated batch
 * @property {string} query - Associated query context
 * @property {number} totalSources - Total unique sources evaluated
 * @property {import('./sourceAuthenticityProfile.contract.js').SourceAuthenticityProfile[]} evaluatedSources - Evaluated source profiles
 * @property {string} generatedAt - ISO 8601 generation timestamp
 * @property {BatchExecutionSummary} executionSummary - Batch summary metrics
 */

export {};
