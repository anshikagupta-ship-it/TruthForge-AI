/**
 * Canonical Report Data Contract Specification
 *
 * @typedef {Object} ReportMetadata
 * @property {string} reportId - Unique identifier of the report run
 * @property {string} reportVersion - Schema version of the canonical report
 * @property {string} generatedAt - ISO 8601 timestamp of report generation
 * @property {string} pipelineVersion - Version of the TruthForge pipeline run
 * @property {string} templateVersion - Version of template configurations applied
 * @property {number} executionTimeMs - Report generation latency in ms
 * @property {string} checksum - SHA-256 integrity checksum of the canonical report structure
 *
 * @typedef {Object} ExecutiveSummary
 * @property {string} overallVerdict - Primary macroscopic verdict (FULLY_SUPPORTED, PARTIALLY_SUPPORTED, CONTRADICTED, INSUFFICIENT_EVIDENCE, MIXED_EVIDENCE)
 * @property {number} overallConfidence - Aggregate pipeline confidence score (0-100)
 * @property {number} verifiedClaims - Total claims evaluated
 * @property {number} supportedClaims - Number of supported claims
 * @property {number} contradictedClaims - Number of contradicted claims
 * @property {number} insufficientClaims - Number of claims with insufficient evidence
 * @property {number} totalEvidenceItems - Total evidence snippets analyzed
 * @property {number} uniqueSourcesUsed - Count of distinct source domains
 * @property {string[]} highestAuthoritySources - Top authority domains (.gov, .edu, medical)
 *
 * @typedef {Object} ClaimReport
 * @property {string} claimId - Unique ID of the claim
 * @property {string} claim - Extracted claim text statement
 * @property {string} verificationStatus - Verification verdict status (SUPPORTED, PARTIALLY_SUPPORTED, CONTRADICTED, INSUFFICIENT_EVIDENCE, UNVERIFIABLE)
 * @property {number} confidence - Deterministic confidence score (0-100)
 * @property {string} confidenceLevel - Categorical confidence level (VERY_HIGH, HIGH, MEDIUM, LOW, VERY_LOW)
 * @property {string[]} supportingEvidence - Array of supporting evidence text snippets
 * @property {string[]} contradictingEvidence - Array of contradicting evidence text snippets
 * @property {string[]} sourceProfiles - Array of source domain authority descriptions
 * @property {string[]} explanation - Array of deterministic natural language explanation strings
 * @property {string[]} provenancePath - Lineage graph traversal nodes
 * @property {number} penaltyCount - Count of applied confidence penalties
 *
 * @typedef {Object} ReportSection
 * @property {string} id - Section unique identifier
 * @property {string} title - Human-readable section heading
 * @property {number} order - Numerical sequence order (1-10)
 * @property {any} content - Structured content payload for the section
 *
 * @typedef {Object} TruthForgeReport
 * @property {ReportMetadata} metadata - Report execution metadata
 * @property {ExecutiveSummary} executiveSummary - Macro executive summary metrics
 * @property {ReportSection[]} sections - Array of 10 canonical report sections
 */

export {};
