/**
 * LLM Provider Base Interface
 * Standard abstraction for LLM vendors (OpenAI, Gemini, Anthropic, Ollama)
 */
export class LLMProviderInterface {
  /**
   * @param {string} providerName 
   */
  constructor(providerName = 'abstract-provider') {
    this.providerName = providerName;
  }

  /**
   * Generates structured JSON output from system and user prompts
   * @param {string} systemPrompt 
   * @param {string} userPrompt 
   * @param {Object} [jsonSchema] 
   * @returns {Promise<{ rawResponse: string, provider: string }>}
   */
  async generateJson(systemPrompt, userPrompt, jsonSchema = null) {
    throw new Error(`Method generateJson() must be implemented by provider [${this.providerName}]`);
  }
}
