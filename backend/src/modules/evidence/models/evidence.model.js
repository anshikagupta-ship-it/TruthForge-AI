import { randomUUID } from 'node:crypto';

/**
 * Domain model representing a normalized Evidence record.
 */
export class EvidenceModel {
  /**
   * Constructs a normalized Evidence instance.
   * @param {Object} params
   * @param {string} params.query - Cleaned research query
   * @param {string} params.sourceUrl - Validated source URL
   * @param {number} params.semanticScore - Semantic similarity score [0, 1]
   * @param {number} params.retrievalScore - Retrieval score [0, 1] (from CSV 'score')
   * @param {number} [params.bonus=0] - Additional score bonus
   * @param {string} params.text - Cleaned evidence snippet
   * @param {number} params.rowNumber - 1-based CSV line number
   * @param {string} [params.id] - Optional predefined UUID (generated automatically if omitted)
   * @param {Date|string} [params.importedAt] - Ingestion timestamp
   * @param {Object} [params.metadata={}] - Additional metadata store
   */
  constructor({
    query,
    sourceUrl,
    semanticScore,
    retrievalScore,
    bonus = 0,
    text,
    rowNumber,
    id = null,
    importedAt = null,
    metadata = {},
  }) {
    this.id = id || randomUUID();
    this.query = String(query).trim();
    this.sourceUrl = String(sourceUrl).trim();
    this.sourceDomain = EvidenceModel.extractDomain(this.sourceUrl);
    this.semanticScore = Number(semanticScore);
    this.retrievalScore = Number(retrievalScore);
    this.bonus = Number(bonus) || 0;
    this.text = String(text).trim();
    this.rowNumber = Number(rowNumber);
    this.importedAt = importedAt ? new Date(importedAt) : new Date();

    this.metadata = {
      provider: 'CSV',
      providerVersion: '1.0.0',
      generatedBy: 'RetrievalModel',
      ingestionTimestamp: this.importedAt,
      ...(metadata && typeof metadata === 'object' ? metadata : {}),
    };
  }

  /**
   * Safely extracts domain name from URL string.
   * @param {string} urlString
   * @returns {string} Domain hostname (or empty string if invalid)
   */
  static extractDomain(urlString) {
    try {
      const parsed = new URL(urlString);
      return parsed.hostname.replace(/^www\./i, '');
    } catch {
      return '';
    }
  }

  /**
   * Formats model into plain JSON object.
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      query: this.query,
      sourceUrl: this.sourceUrl,
      sourceDomain: this.sourceDomain,
      semanticScore: this.semanticScore,
      retrievalScore: this.retrievalScore,
      bonus: this.bonus,
      text: this.text,
      rowNumber: this.rowNumber,
      importedAt: this.importedAt,
      metadata: this.metadata,
    };
  }
}
