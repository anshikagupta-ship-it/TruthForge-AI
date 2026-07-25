/**
 * Source Authenticity Profile Contract
 * JSDoc Type Definition for SourceAuthenticityProfile
 *
 * @typedef {'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'} AuthenticityLevel
 *
 * @typedef {'Government' | 'Academic Journal' | 'University' | 'Medical Organization' |
 *           'International Organization' | 'Research Repository' | 'Scientific Publisher' |
 *           'Standards Organization' | 'News Organization' | 'Commercial' |
 *           'Community Wiki' | 'Blog' | 'Forum' | 'Social Media' | 'Unknown'} SourceType
 *
 * @typedef {Object} EvaluationMetadata
 * @property {string} evaluatedAt - ISO 8601 timestamp
 * @property {string} evaluatorVersion - Evaluator version string
 * @property {string} registryVersion - Authority registry version string
 * @property {string[]} rulesApplied - List of rule IDs evaluated
 * @property {boolean} cacheHit - Whether profile was served from cache
 * @property {number} executionTimeMs - Latency of evaluation in milliseconds
 *
 * @typedef {Object} SourceAuthenticityProfile
 * @property {string} sourceId - Unique deterministic source ID (hash of domain/URL)
 * @property {string} sourceUrl - Original raw URL
 * @property {string} normalizedUrl - Normalized URL string
 * @property {string} domain - Registered domain (e.g., "who.int")
 * @property {SourceType} sourceType - Categorized source classification
 * @property {number} authenticityScore - Final score normalized to 0-100
 * @property {AuthenticityLevel} authenticityLevel - Mapped trust level
 * @property {import('./authenticityFactors.contract.js').AuthenticityFactors} evaluationFactors - Breakdown of factors
 * @property {EvaluationMetadata} metadata - Evaluation execution metadata
 */

export {};
