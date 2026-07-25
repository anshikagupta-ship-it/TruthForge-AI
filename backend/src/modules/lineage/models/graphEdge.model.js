/**
 * GraphEdge Domain Model
 */

import { generateEdgeId } from '../utils/lineageUtils.js';

/**
 * @typedef {"SUPPORTED_BY" | "CONTRADICTED_BY" | "FROM" | "HAS_PROFILE"} EdgeType
 */

export class GraphEdgeModel {
  /**
   * @param {Object} params
   * @param {string} [params.id]
   * @param {string} params.sourceNodeId
   * @param {string} params.targetNodeId
   * @param {EdgeType} params.type
   * @param {Record<string, any>} [params.properties]
   */
  constructor({ id, sourceNodeId, targetNodeId, type, properties = {} }) {
    if (!sourceNodeId || !targetNodeId || !type) {
      throw new Error('GraphEdgeModel requires sourceNodeId, targetNodeId, and type');
    }
    this.sourceNodeId = sourceNodeId;
    this.targetNodeId = targetNodeId;
    this.type = type;
    this.properties = properties;
    this.id = id || generateEdgeId(sourceNodeId, targetNodeId, type);
  }

  toJSON() {
    return {
      id: this.id,
      sourceNodeId: this.sourceNodeId,
      targetNodeId: this.targetNodeId,
      type: this.type,
      properties: this.properties,
    };
  }
}
