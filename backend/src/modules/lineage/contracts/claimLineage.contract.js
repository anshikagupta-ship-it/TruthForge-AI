/**
 * Claim Lineage Contract
 * JSDoc Type Definitions for ClaimLineage
 *
 * @typedef {Object} ClaimLineage
 * @property {string} claimId - Unique claim identifier (e.g. "clm_101")
 * @property {import('./evidenceReference.contract.js').EvidenceReference[]} supportingEvidence - Array of supporting evidence references
 * @property {import('./evidenceReference.contract.js').EvidenceReference[]} contradictingEvidence - Array of contradicting evidence references
 * @property {string[]} sourceProfiles - List of referenced SourceAuthenticityProfile IDs linked to this claim
 */

export {};
