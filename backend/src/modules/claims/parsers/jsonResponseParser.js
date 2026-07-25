import { logger } from '../../../utils/logger.js';

export class JsonResponseParser {
  /**
   * Safely extracts and parses JSON payload from LLM output string, handling markdown code fences.
   * @param {string} rawOutput 
   * @returns {Object} Parsed JSON object
   */
  static parse(rawOutput) {
    if (!rawOutput || typeof rawOutput !== 'string') {
      throw new Error('Raw LLM response is empty or non-string');
    }

    let cleaned = rawOutput.trim();

    // Remove markdown code fences if present (```json ... ``` or ``` ...)
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    // Locate first '{' and last '}' in case of conversational preambles
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      logger.warn(`[JsonResponseParser] JSON.parse failed. Raw snippet: "${rawOutput.substring(0, 150)}..."`);
      throw new Error(`Failed to parse LLM response as JSON: ${err.message}`);
    }
  }
}
