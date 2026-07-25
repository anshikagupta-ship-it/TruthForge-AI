import { LLMProviderInterface } from './llmProvider.interface.js';
import { logger } from '../../../utils/logger.js';

export class GeminiProvider extends LLMProviderInterface {
  constructor(apiKey = process.env.GEMINI_API_KEY, model = process.env.GEMINI_MODEL || 'gemini-1.5-pro') {
    super(`google/${model}`);
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateJson(systemPrompt, userPrompt, jsonSchema = null) {
    if (!this.apiKey) {
      logger.warn('[GeminiProvider] GEMINI_API_KEY missing. Returning fallback provider structure.');
      return {
        rawResponse: JSON.stringify({ extractedClaims: [] }),
        provider: this.providerName,
      };
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          }
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Gemini API call failed [HTTP ${response.status}]: ${errBody}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        rawResponse: content,
        provider: this.providerName,
      };
    } catch (err) {
      logger.error(`[GeminiProvider] Execution error: ${err.message}`);
      throw err;
    }
  }
}
