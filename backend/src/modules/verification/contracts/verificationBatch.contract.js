/**
 * VerificationBatch Contract Definition
 * Output data contract returned by the Claim Verification Module.
 */

/**
 * @typedef {import('./verifiedClaim.contract.js').VerifiedClaim} VerifiedClaim
 */

/**
 * @typedef {Object} VerificationBatch
 * @property {string} query - The original user search query
 * @property {number} totalClaims - Total count of verified claims in batch
 * @property {VerifiedClaim[]} verifiedClaims - Array of verified claim domain objects
 * @property {Object} [executionSummary] - Overall execution stats for the batch
 */

export {};
