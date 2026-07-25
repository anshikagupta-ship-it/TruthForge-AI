/**
 * Evidence Reference Contract
 * JSDoc Type Definitions for EvidenceReference
 *
 * @typedef {"SUPPORTS" | "CONTRADICTS"} RelationshipType
 *
 * @typedef {Object} EvidenceReference
 * @property {string} evidenceId - Unique evidence identifier (e.g. "ev_001")
 * @property {string} sourceId - Unique originating source identifier (e.g. "src_a1b2c3d4")
 * @property {string} sourceUrl - Canonical source URL
 * @property {RelationshipType} relationship - Type of evidence relationship ("SUPPORTS" | "CONTRADICTS")
 * @property {number} relevance - Relevance score [0.0 - 1.0]
 */

export {};
