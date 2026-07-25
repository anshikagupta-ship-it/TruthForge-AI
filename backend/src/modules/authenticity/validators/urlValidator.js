/**
 * URL Validator
 * Structural validation of incoming source URLs and protocols.
 */

export class UrlValidator {
  /**
   * Validate if input string is a parseable URL
   * @param {string} urlString
   * @returns {{ isValid: boolean, protocol: string|null, error: string|null }}
   */
  static validateUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') {
      return { isValid: false, protocol: null, error: 'URL must be a non-empty string' };
    }

    const trimmed = urlString.trim();

    // Check if protocol missing, attempt prepend for validation
    let testUrl = trimmed;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      testUrl = 'https://' + trimmed;
    }

    try {
      const parsed = new URL(testUrl);
      const isHttpOrHttps = parsed.protocol === 'http:' || parsed.protocol === 'https:';

      if (!isHttpOrHttps) {
        return { isValid: false, protocol: parsed.protocol, error: `Unsupported protocol: ${parsed.protocol}` };
      }

      if (!parsed.hostname || parsed.hostname.length < 3 || !parsed.hostname.includes('.')) {
        return { isValid: false, protocol: parsed.protocol, error: 'Invalid domain structure' };
      }

      return { isValid: true, protocol: parsed.protocol, error: null };
    } catch (err) {
      return { isValid: false, protocol: null, error: `Malformed URL format: ${err.message}` };
    }
  }
}
