/**
 * Confidence Batch Contract
 * JSDoc Type Definition for ConfidenceBatch
 *
 * @typedef {Object} ConfidenceBatchMetadata
 * @property {string} processedAt - ISO 8601 timestamp of batch processing completion
 * @property {string} policyProfile - Name of the policy configuration profile applied
 * @property {number} totalExecutionTimeMs - Total time taken to compute batch in ms
 * @property {string} engineVersion - Engine semver identifier
 *
 * @typedef {Object} ConfidenceBatch
 * @property {string} batchId - Unique identifier of the confidence batch run
 * @property {string} query - Original research query string
 * @property {number} totalClaims - Total count of claims evaluated in this batch
 * @property {import('./claimConfidence.contract.js').ClaimConfidence[]} claims - List of claim confidence evaluation objects
 * @property {ConfidenceBatchMetadata} metadata - Batch execution metadata
 */

export {};
