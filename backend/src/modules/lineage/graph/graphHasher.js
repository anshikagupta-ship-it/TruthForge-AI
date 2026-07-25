/**
 * Graph Hasher
 * Computes deterministic SHA-256 root cryptographic hash for MemoryGraph
 */

import crypto from 'crypto';
import { canonicalJsonStringify } from '../utils/lineageUtils.js';

export class GraphHasher {
  /**
   * Compute deterministic SHA-256 root hash of MemoryGraph
   * @param {import('./memoryGraph.js').MemoryGraph} graph
   * @returns {string} SHA-256 hash string
   */
  static computeGraphHash(graph) {
    if (!graph) return '';

    // Sort nodes deterministically by ID
    const sortedNodes = graph
      .getAllNodes()
      .map((n) => n.toJSON())
      .sort((a, b) => a.id.localeCompare(b.id));

    // Sort edges deterministically by ID
    const sortedEdges = graph
      .getAllEdges()
      .map((e) => e.toJSON())
      .sort((a, b) => a.id.localeCompare(b.id));

    const canonicalPayload = canonicalJsonStringify({
      nodes: sortedNodes,
      edges: sortedEdges,
    });

    return crypto.createHash('sha256').update(canonicalPayload).digest('hex');
  }

  /**
   * Compute hash for an individual claim lineage sub-graph
   * @param {import('../contracts/claimLineage.contract.js').ClaimLineage} claimLineage
   * @returns {string}
   */
  static computeClaimLineageHash(claimLineage) {
    if (!claimLineage) return '';
    const canonicalPayload = canonicalJsonStringify(claimLineage);
    return crypto.createHash('sha256').update(canonicalPayload).digest('hex');
  }
}
