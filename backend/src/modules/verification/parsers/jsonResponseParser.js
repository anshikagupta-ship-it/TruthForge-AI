/**
 * JSON Response Parser
 * Safely extracts, cleans, and parses raw LLM text output into structured JSON objects.
 */

export class JsonResponseParser {
  /**
   * Parses raw LLM text string into clean JSON object
   * @param {string} rawResponse - Raw string response from LLM provider
   * @returns {Object} Parsed JSON object
   * @throws {Error} If parsing fails completely after cleanup attempts
   */
  static parse(rawResponse) {
    if (!rawResponse || typeof rawResponse !== 'string') {
      throw new Error('JsonResponseParser: Empty or non-string response received from LLM.');
    }

    let cleaned = rawResponse.trim();

    // 1. Strip markdown code fences (```json ... ``` or ``` ...)
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
    cleaned = cleaned.trim();

    // 2. Extract first valid JSON object using curly brace bounds
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // 3. Attempt direct JSON parse
    try {
      return JSON.parse(cleaned);
    } catch (primaryErr) {
      // 4. Attempt auto-repair for common LLM JSON syntax errors (trailing commas, unescaped quotes)
      try {
        const repaired = cleaned
          .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas before closing braces/brackets
          .replace(/[\u201C\u201D]/g, '"'); // Normalize curly smart quotes

        return JSON.parse(repaired);
      } catch (repairErr) {
        throw new Error(`JsonResponseParser: Failed to parse raw LLM JSON: ${primaryErr.message} | Snippet: "${cleaned.substring(0, 150)}..."`);
      }
    }
  }
}
