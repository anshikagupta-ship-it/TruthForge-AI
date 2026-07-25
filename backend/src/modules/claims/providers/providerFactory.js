import { OpenAiProvider } from './openAiProvider.js';
import { GeminiProvider } from './geminiProvider.js';
import { AnthropicProvider } from './anthropicProvider.js';
import { logger } from '../../../utils/logger.js';

export class ProviderFactory {
  /**
   * Resolves an LLM provider based on vendor name or environment config
   * @param {string} [vendorName] - 'openai' | 'gemini' | 'anthropic'
   * @returns {import('./llmProvider.interface.js').LLMProviderInterface}
   */
  static getProvider(vendorName = process.env.CLAIM_LLM_PROVIDER || 'openai') {
    const normalizedVendor = vendorName.toLowerCase().trim();

    switch (normalizedVendor) {
      case 'openai':
        return new OpenAiProvider();
      case 'gemini':
      case 'google':
        return new GeminiProvider();
      case 'anthropic':
      case 'claude':
        return new AnthropicProvider();
      default:
        logger.warn(`[ProviderFactory] Unknown provider [${vendorName}]. Defaulting to OpenAI.`);
        return new OpenAiProvider();
    }
  }
}
