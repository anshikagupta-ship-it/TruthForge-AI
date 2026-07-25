/**
 * Report Input Batches Contract Specification
 *
 * @typedef {Object} ReportInputBatches
 * @property {Object} query - Query payload (queryId, queryString, domainContext, userMetadata)
 * @property {Object} evidenceBatch - Evidence batch output from Phase 1
 * @property {Object} [evidenceProfile] - Evidence profile metadata output from Phase 1
 * @property {Object} verificationBatch - Verification batch output from Phase 3
 * @property {Object} sourceAuthenticityBatch - Source authenticity evaluation output from Phase 4
 * @property {Object} evidenceLineageBatch - Evidence lineage provenance output from Phase 5
 * @property {Object} confidenceBatch - Confidence score evaluation output from Phase 6
 */

export {};
