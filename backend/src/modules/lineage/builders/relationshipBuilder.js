/**
 * Relationship Builder
 * Constructs deterministic directed edges (SUPPORTED_BY, CONTRADICTED_BY, FROM, HAS_PROFILE)
 */

import { GraphEdgeModel } from '../models/graphEdge.model.js';
import { generateNodeId } from '../utils/lineageUtils.js';

export class RelationshipBuilder {
  /**
   * Add a SUPPORTED_BY directed edge from Claim to Evidence
   * @param {import('../graph/memoryGraph.js').MemoryGraph} graph
   * @param {string} claimId
   * @param {string} evidenceId
   * @param {number} [relevance=1.0]
   * @returns {GraphEdgeModel}
   */
  static addSupportedByEdge(graph, claimId, evidenceId, relevance = 1.0) {
    const sourceNodeId = generateNodeId('Claim', claimId);
    const targetNodeId = generateNodeId('Evidence', evidenceId);

    const edge = new GraphEdgeModel({
      sourceNodeId,
      targetNodeId,
      type: 'SUPPORTED_BY',
      properties: { relevance },
    });

    return graph.addEdge(edge);
  }

  /**
   * Add a CONTRADICTED_BY directed edge from Claim to Evidence
   * @param {import('../graph/memoryGraph.js').MemoryGraph} graph
   * @param {string} claimId
   * @param {string} evidenceId
   * @param {number} [relevance=1.0]
   * @returns {GraphEdgeModel}
   */
  static addContradictedByEdge(graph, claimId, evidenceId, relevance = 1.0) {
    const sourceNodeId = generateNodeId('Claim', claimId);
    const targetNodeId = generateNodeId('Evidence', evidenceId);

    const edge = new GraphEdgeModel({
      sourceNodeId,
      targetNodeId,
      type: 'CONTRADICTED_BY',
      properties: { relevance },
    });

    return graph.addEdge(edge);
  }

  /**
   * Add a FROM directed edge from Evidence to Source
   * @param {import('../graph/memoryGraph.js').MemoryGraph} graph
   * @param {string} evidenceId
   * @param {string} sourceUrl
   * @returns {GraphEdgeModel}
   */
  static addFromEdge(graph, evidenceId, sourceUrl) {
    const sourceNodeId = generateNodeId('Evidence', evidenceId);
    const targetNodeId = generateNodeId('Source', sourceUrl);

    const edge = new GraphEdgeModel({
      sourceNodeId,
      targetNodeId,
      type: 'FROM',
      properties: { sourceUrl },
    });

    return graph.addEdge(edge);
  }

  /**
   * Add a HAS_PROFILE directed edge from Source to SourceProfile
   * @param {import('../graph/memoryGraph.js').MemoryGraph} graph
   * @param {string} sourceUrl
   * @param {string} profileId
   * @returns {GraphEdgeModel}
   */
  static addHasProfileEdge(graph, sourceUrl, profileId) {
    const sourceNodeId = generateNodeId('Source', sourceUrl);
    const targetNodeId = generateNodeId('SourceProfile', profileId);

    const edge = new GraphEdgeModel({
      sourceNodeId,
      targetNodeId,
      type: 'HAS_PROFILE',
      properties: { profileId },
    });

    return graph.addEdge(edge);
  }
}
