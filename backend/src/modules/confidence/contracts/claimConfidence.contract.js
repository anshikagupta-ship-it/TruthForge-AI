/**
 * Claim Confidence Contract
 * JSDoc Type Definition for ClaimConfidence
 *
 * @typedef {'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW'} ConfidenceLevel
 *
 * @typedef {Object} ClaimConfidenceMetadata
 * @property {string} evaluatedAt - ISO 8601 creation timestamp
 * @property {string} engineVersion - Confidence Engine semver identifier
 * @property {string} weightVersion - Hash or version identifier of weights configuration
 * @property {string} penaltyVersion - Hash or version identifier of penalties configuration
 * @property {number} executionTimeMs - Total execution time for processing this claim in ms
 *
 * @typedef {Object} ClaimConfidence
 * @property {string} claimId - Unique identifier of the evaluated claim
 * @property {number} confidenceScore - Final clamped numerical score [0-100]
 * @property {ConfidenceLevel} confidenceLevel - Categorical confidence label
 * @property {import('./confidenceFactors.contract.js').ConfidenceFactors} confidenceFactors - Sub-factor score breakdown
 * @property {import('./confidenceExplanation.contract.js').ConfidenceExplanation} explanation - Natural language explanation arrays
 * @property {ClaimConfidenceMetadata} metadata - Execution and version metadata
 */

export {};
