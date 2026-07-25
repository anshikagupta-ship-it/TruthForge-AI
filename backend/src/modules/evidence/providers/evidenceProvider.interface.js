/**
 * Abstract EvidenceProvider Interface.
 * Standard contract for all evidence ingestion providers.
 */
export class EvidenceProvider {
  /**
   * Ingests raw input source and returns a normalized EvidenceBatch.
   * @param {any} input - Input stream, file path, buffer, or API payload
   * @param {Object} [options={}] - Additional provider configuration
   * @returns {Promise<import('../models/evidence.model.js').EvidenceBatch>}
   */
  async ingest(input, options = {}) {
    throw new Error("Method 'ingest()' must be implemented by concrete EvidenceProvider subclasses.");
  }
}
