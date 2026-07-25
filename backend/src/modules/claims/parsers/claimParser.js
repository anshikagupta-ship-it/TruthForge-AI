import { JsonResponseParser } from './jsonResponseParser.js';
import { ClaimModel } from '../models/claim.model.js';
import { logger } from '../../../utils/logger.js';

export class ClaimParser {
  /**
   * Transforms raw LLM output text into array of raw claim candidates
   * @param {string} rawLlmResponse 
   * @param {Object} context - Evidence map for domain resolution
   * @returns {Array<{statement: string, supportingEvidenceIds: string[]}>}
   */
  static parseRawClaims(rawLlmResponse) {
    const jsonObj = JsonResponseParser.parse(rawLlmResponse);

    if (!jsonObj || !Array.isArray(jsonObj.extractedClaims)) {
      logger.warn('[ClaimParser] LLM output missing "extractedClaims" array');
      return [];
    }

    return jsonObj.extractedClaims.map(item => ({
      statement: typeof item.statement === 'string' ? item.statement.trim() : '',
      supportingEvidenceIds: Array.isArray(item.supportingEvidenceIds)
        ? item.supportingEvidenceIds.map(id => String(id).trim())
        : [],
    }));
  }
}
