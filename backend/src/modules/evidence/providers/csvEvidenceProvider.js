import { EvidenceProvider } from './evidenceProvider.interface.js';
import { parseCsvStream } from '../parser/csvParser.js';

/**
 * CSV Implementation of EvidenceProvider.
 * Converts raw Retrieval Model CSV files into normalized EvidenceBatch objects.
 */
export class CsvEvidenceProvider extends EvidenceProvider {
  /**
   * @param {Function} [parser=parseCsvStream] - Injectable parser function
   */
  constructor(parser = parseCsvStream) {
    super();
    this.parser = parser;
  }

  /**
   * Ingests CSV source and produces a normalized EvidenceBatch.
   * @param {import('node:stream').Readable|Buffer|string} input
   * @param {Object} [options={}]
   * @returns {Promise<{ evidenceBatch: Object, invalidRowReasons: Object.<string, number> }>}
   */
  async ingest(input, options = {}) {
    return await this.parser(input, options);
  }
}
