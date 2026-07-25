/**
 * Pure deterministic template variable interpolator.
 * Substitutes {{variable}} placeholders with stringified values.
 */
export class TemplateInterpolator {
  /**
   * Interpolates template string with parameters object.
   *
   * @param {string} templateString
   * @param {Record<string, any>} params
   * @returns {string}
   */
  static interpolate(templateString, params = {}) {
    if (typeof templateString !== 'string') return '';
    return templateString.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        return String(params[key]);
      }
      return match;
    });
  }
}
