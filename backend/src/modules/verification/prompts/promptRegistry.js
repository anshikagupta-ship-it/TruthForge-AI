/**
 * Prompt Registry
 * Manages domain-specific system prompts and user prompt generation.
 */

import {
  SYSTEM_PROMPT_GENERAL,
  SYSTEM_PROMPT_MEDICAL,
  SYSTEM_PROMPT_LEGAL,
  SYSTEM_PROMPT_SCIENTIFIC,
} from './systemPrompts.js';
import { buildUserPrompt } from './userPrompts.js';

export class PromptRegistry {
  /**
   * Resolves appropriate system prompt based on domain metadata
   * @param {string} [domain='general'] - 'general' | 'medical' | 'legal' | 'scientific'
   * @returns {string} System prompt string
   */
  static getSystemPrompt(domain = 'general') {
    const normalizedDomain = String(domain || 'general').toLowerCase().trim();

    switch (normalizedDomain) {
      case 'medical':
      case 'health':
      case 'clinical':
        return SYSTEM_PROMPT_MEDICAL;

      case 'legal':
      case 'jurisprudence':
      case 'regulatory':
        return SYSTEM_PROMPT_LEGAL;

      case 'scientific':
      case 'technical':
      case 'academic':
        return SYSTEM_PROMPT_SCIENTIFIC;

      default:
        return SYSTEM_PROMPT_GENERAL;
    }
  }

  /**
   * Generates formatted user prompt
   * @param {Object} params
   * @returns {string} User prompt string
   */
  static getUserPrompt(params) {
    return buildUserPrompt(params);
  }
}
