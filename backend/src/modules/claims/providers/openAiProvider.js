import { LLMProviderInterface } from './llmProvider.interface.js';
import { logger } from '../../../utils/logger.js';

export class OpenAiProvider extends LLMProviderInterface {
  constructor(apiKey = process.env.OPENAI_API_KEY, model = process.env.OPENAI_MODEL || 'gpt-4o') {
    super(`openai/${model}`);
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateJson(systemPrompt, userPrompt, jsonSchema = null) {
    if (!this.apiKey) {
      logger.warn('[OpenAiProvider] OPENAI_API_KEY missing. Returning mock response for testing/development.');
      return {
        rawResponse: JSON.stringify({
          extractedClaims: [
            {
              statement: "Contaminated water spreads infectious diseases.",
              supportingEvidenceIds: ["evidence-1"]
            }
          ]
        }),
        provider: this.providerName,
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API call failed [HTTP ${response.status}]: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      return {
        rawResponse: content,
        provider: this.providerName,
      };
    } catch (err) {
      logger.error(`[OpenAiProvider] Execution failed: ${err.message}`);
      throw err;
    }
  }
}
