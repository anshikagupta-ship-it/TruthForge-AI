/**
 * Base Authenticity Rule Class
 * Abstract interface for pluggable evaluation rules.
 */

export class BaseRule {
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  /**
   * Execute rule against domain context
   * @param {Object} context
   * @param {string} context.domain
   * @param {string} context.protocol
   * @param {Object} [context.registryMatch]
   * @param {string} context.sourceType
   * @returns {{ ruleId: string, factorImpacted: string, scoreContribution: number, flags: Object }}
   */
  execute(context) {
    throw new Error(`Rule '${this.id}' must implement execute(context)`);
  }
}
