/**
 * Registry Validator
 * Validates integrity of loaded JSON authority registry schema structure.
 */

export class RegistryValidator {
  /**
   * Validate JSON registry object structure
   * @param {Object} registryJson
   * @returns {{ isValid: boolean, errors: string[] }}
   */
  static validateRegistry(registryJson) {
    const errors = [];

    if (!registryJson || typeof registryJson !== 'object') {
      return { isValid: false, errors: ['Registry payload must be a non-null object'] };
    }

    if (!registryJson.category || typeof registryJson.category !== 'string') {
      errors.push('Missing or invalid "category" field');
    }

    if (!Array.isArray(registryJson.entries)) {
      errors.push('Missing or invalid "entries" array');
    } else {
      registryJson.entries.forEach((entry, index) => {
        if (!entry.id) errors.push(`Entry at index ${index} missing "id"`);
        if (!entry.domain) errors.push(`Entry at index ${index} missing "domain"`);
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
