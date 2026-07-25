/**
 * VerifiedClaim Contract Definition
 * Defines the structure of an evaluated claim with evidence grounding.
 */

/**
 * @typedef {Object} MatchedEvidenceItem
 * @property {string} evidenceId - Unique identifier of the evaluated evidence item
 * @property {number|string} relevance - Relevance score [0.0 - 1.0] or label
 * @property {string} notes - Grounded notes on how snippet relates to statement
 */

/**
 * @typedef {Object} VerifiedClaimMetadata
 * @property {string} verifiedAt - ISO-8601 UTC timestamp of verification completion
 * @property {string} verifier - Identifier of the verifying system component
 * @property {string} verifierVersion - Semantic version of the verification engine
 * @property {string} promptVersion - Semantic version of the prompt template used
 * @property {number} executionTimeMs - Execution duration in milliseconds
 * @property {boolean} [isFallback] - Flag indicating fallback degradation due to LLM/validation errors
 */

/**
 * @typedef {("SUPPORTED"|"PARTIALLY_SUPPORTED"|"CONTRADICTED"|"INSUFFICIENT_EVIDENCE"|"UNVERIFIABLE")} VerificationStatus
 */

/**
 * @typedef {Object} VerifiedClaim
 * @property {string} claimId - Unique identifier of the claim
 * @property {string} statement - The exact, unmodified claim statement
 * @property {VerificationStatus} verificationStatus - Categorical status result
 * @property {string[]} supportingEvidenceIds - Evidence IDs supporting the claim
 * @property {string[]} contradictingEvidenceIds - Evidence IDs contradicting the claim
 * @property {string} explanation - Concise, evidence-grounded rationale for status
 * @property {MatchedEvidenceItem[]} matchedEvidence - Array of evaluated evidence items
 * @property {VerifiedClaimMetadata} metadata - Operational metrics and execution lineage
 */

export {};
