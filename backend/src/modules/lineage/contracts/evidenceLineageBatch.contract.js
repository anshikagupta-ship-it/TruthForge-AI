/**
 * Evidence Lineage Batch Contract
 * JSDoc Type Definitions for EvidenceLineageBatch & Metadata
 *
 * @typedef {Object} LineageValidationSummary
 * @property {number} totalNodes - Total nodes constructed in lineage graph
 * @property {number} totalEdges - Total directed edges constructed in lineage graph
 * @property {number} orphanNodes - Count of disconnected evidence/source nodes
 * @property {number} missingReferences - Count of unresolvable reference IDs handled
 * @property {number} duplicateEdgesRemoved - Count of redundant edges deduplicated
 * @property {boolean} isValid - Overall structural validity status
 *
 * @typedef {Object} LineageMetadata
 * @property {string} generatedAt - ISO 8601 creation timestamp
 * @property {string} generatorVersion - Version of lineage engine (e.g. "1.0.0")
 * @property {string} graphVersion - Schema version of graph (e.g. "v1")
 * @property {string} graphHash - Cryptographic root SHA-256 hash of entire graph
 * @property {number} executionTimeMs - Processing latency in milliseconds
 * @property {LineageValidationSummary} validationSummary - Summary of graph validation checks
 *
 * @typedef {Object} EvidenceLineageBatch
 * @property {string} batchId - Unique lineage batch identifier (e.g. "elb_99f8e7a1")
 * @property {string} query - User query context
 * @property {number} totalClaims - Count of claims represented in lineage
 * @property {import('./claimLineage.contract.js').ClaimLineage[]} lineage - Array of claim lineage objects
 * @property {LineageMetadata} metadata - Metadata detailing graph execution and integrity
 */

export {};
