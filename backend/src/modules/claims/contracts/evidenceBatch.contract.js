/**
 * EvidenceBatch Contract Definitions
 * Represents the normalized evidence payload flowing from Evidence Ingestion into Claim Generation.
 */

/**
 * @typedef {Object} EvidenceItem
 * @property {string} evidenceId - Unique ID assigned during ingestion (e.g., "evidence-1")
 * @property {string} text - Cleaned, normalized evidence snippet
 * @property {string} sourceUrl - Full source URL of evidence
 * @property {string} sourceDomain - Derived domain (e.g., "who.int")
 * @property {number} [semanticScore] - Retrieval relevance score [0.0 - 1.0]
 * @property {number} [retrievalScore] - Scraper rank score
 * @property {Object} [metadata] - Ingestion metadata
 */

/**
 * @typedef {Object} EvidenceBatch
 * @property {string} batchId - Unique ID of the evidence batch
 * @property {string} queryId - Root pipeline user query ID
 * @property {string} query - The exact user search query statement
 * @property {EvidenceItem[]} evidences - Array of normalized evidence items
 * @property {string[]} [sourceUrls] - Distinct list of source URLs
 * @property {Object} [metadata] - Batch creation & provider context
 */

export {};
