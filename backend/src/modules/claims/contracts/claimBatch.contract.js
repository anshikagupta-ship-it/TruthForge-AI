/**
 * Claim & ClaimBatch Contract Definitions
 * Output data contracts returned by the Claim Generator Module.
 */

/**
 * @typedef {Object} ClaimMetadata
 * @property {number} evidenceCount - Number of supporting evidence items linked
 * @property {number} sourceCount - Number of distinct source domains linked
 * @property {string} generatedBy - Model provider identifier (e.g., "openai/gpt-4o")
 * @property {string} generationTimestamp - ISO 8601 UTC timestamp of creation
 * @property {number} [deduplicatedFromCount] - Number of duplicate claims merged into this claim
 * @property {string[]} [originalStatements] - Pre-deduplication statements if merged
 */

/**
 * @typedef {Object} Claim
 * @property {string} claimId - Unique identifier (e.g., "claim-8f3a12b4")
 * @property {string} statement - Concise, atomic factual statement
 * @property {string[]} supportingEvidenceIds - Array of evidence IDs (e.g., ["evidence-2", "evidence-9"])
 * @property {string[]} sourceDomains - Array of distinct source domains (e.g., ["who.int", "cdc.gov"])
 * @property {string} generatedAt - ISO 8601 string timestamp
 * @property {ClaimMetadata} metadata - Operational metrics & lineage context
 */

/**
 * @typedef {Object} ClaimBatch
 * @property {string} batchId - Unique claim batch identifier
 * @property {string} queryId - Root pipeline user query ID
 * @property {string} query - The exact user search query statement
 * @property {number} totalClaims - Total validated claims in batch
 * @property {Claim[]} claims - Array of structured claim objects
 * @property {Object} [executionSummary] - Execution runtime statistics
 */

export {};
