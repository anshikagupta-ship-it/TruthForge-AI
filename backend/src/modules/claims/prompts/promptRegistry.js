import { BASE_SYSTEM_PROMPT, DOMAIN_SYSTEM_PROMPTS } from './systemPrompts.js';
import { buildUserPrompt } from './userPrompts.js';

export class PromptRegistry {
  /**
   * Resolves appropriate system prompt based on domain classification
   * @param {string} [domain] - 'medical' | 'legal' | 'scientific' | 'general'
   * @returns {string} System prompt text
   */
  static getSystemPrompt(domain = 'general') {
    const key = (domain || 'general').toLowerCase().trim();
    return DOMAIN_SYSTEM_PROMPTS[key] || BASE_SYSTEM_PROMPT;
  }

  /**
   * Resolves rendered user prompt
   * @param {Object} context
   * @returns {string} User prompt text
   */
  static getUserPrompt(context) {
    return buildUserPrompt(context);
  }
}
