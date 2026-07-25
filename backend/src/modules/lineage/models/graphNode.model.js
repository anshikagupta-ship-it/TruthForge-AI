/**
 * GraphNode Domain Model
 */

import { generateNodeId } from '../utils/lineageUtils.js';

/**
 * @typedef {"Claim" | "Evidence" | "Source" | "SourceProfile"} NodeType
 */

export class GraphNodeModel {
  /**
   * @param {Object} params
   * @param {string} [params.id]
   * @param {NodeType} params.type
   * @param {string} [params.label]
   * @param {Record<string, any>} [params.properties]
   */
  constructor({ id, type, label, properties = {} }) {
    if (!type) {
      throw new Error('GraphNodeModel requires a valid type ("Claim", "Evidence", "Source", "SourceProfile")');
    }
    this.type = type;
    this.properties = properties;

    let key = properties.entityId || properties.id;
    if (type === 'Source') {
      key = properties.sourceUrl || properties.url || properties.sourceId || key;
    } else if (type === 'Claim') {
      key = properties.claimId || key;
    } else if (type === 'Evidence') {
      key = properties.evidenceId || key;
    } else if (type === 'SourceProfile') {
      key = properties.profileId || key;
    }

    this.id = id || generateNodeId(type, key || 'unknown');
    this.label = label || `${type} (${this.id})`;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      label: this.label,
      properties: this.properties,
    };
  }
}
