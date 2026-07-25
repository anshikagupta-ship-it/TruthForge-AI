/**
 * Confidence Factors Contract
 * JSDoc Type Definition for ConfidenceFactors
 *
 * @typedef {Object} ConfidenceFactors
 * @property {number} verificationStrength - Score derived from verdict status (SUPPORTED = 100, CONTRADICTED = 20, etc.) [0-100]
 * @property {number} evidenceStrength - Aggregate score derived from semantic relevance, retrieval score, and text quality [0-100]
 * @property {number} sourceAuthenticity - Average source authenticity score derived from Phase 4 profiles [0-100]
 * @property {number} provenanceCompleteness - Lineage graph completeness score derived from Phase 5 nodes [0-100]
 * @property {number} evidenceAgreement - Degree of agreement among independent evidence sources [0-100]
 * @property {number} evidenceCoverage - Proportion of claim key concepts supported by evidence [0-100]
 * @property {number} contradictionPenalty - Score penalty metric representing contradiction weight [0-100]
 * @property {number} retrievalQuality - Score representing retrieval model relevance and domain diversity [0-100]
 */

export {};
