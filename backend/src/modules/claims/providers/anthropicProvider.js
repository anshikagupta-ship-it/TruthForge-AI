import { LLMProviderInterface } from './llmProvider.interface.js';
import { logger } from '../../../utils/logger.js';

export class AnthropicProvider extends LLMProviderInterface {
  constructor(apiKey = process.env.ANTHROPIC_API_KEY, model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620') {
    super(`anthropic/${model}`);
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateJson(systemPrompt, userPrompt, jsonSchema = null) {
    if (!this.apiKey) {
      logger.warn('[AnthropicProvider] ANTHROPIC_API_KEY missing. Returning fallback provider response.');
      return {
        rawResponse: JSON.stringify({ extractedClaims: [] }),
        provider: this.providerName,
      };
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          max_tokens: 2048,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API call failed [HTTP ${response.status}]: ${errorText}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || '';

      return {
        rawResponse: content,
        provider: this.providerName,
      };
    } catch (err) {
      logger.error(`[AnthropicProvider] Execution failed: ${err.message}`);
      throw err;
    }
  }
}
