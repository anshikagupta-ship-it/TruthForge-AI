/**
 * EvidenceProfile Contract Definitions
 * Represents profiling metrics and quality warnings produced by the Evidence Profiling Engine.
 */

/**
 * @typedef {Object} QualityWarning
 * @property {string} code - Warning identifier (e.g., "LOW_SOURCE_DIVERSITY")
 * @property {string} severity - "CRITICAL" | "WARNING" | "INFO"
 * @property {string} message - Descriptive warning text
 */

/**
 * @typedef {Object} EvidenceProfile
 * @property {string} profileId - Unique ID of the profile
 * @property {string} batchId - Reference to target EvidenceBatch
 * @property {number} totalEvidences - Total valid items in batch
 * @property {number} distinctSourcesCount - Unique source domains count
 * @property {QualityWarning[]} [qualityWarnings] - List of detected quality flags
 * @property {Object} [healthMetrics] - Quantified batch health & noise metrics
 */

export {};
