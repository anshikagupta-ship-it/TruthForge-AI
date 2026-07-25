/**
 * Lineage Validator
 * Validates graph structural integrity, orphans, missing references, and cycles
 */

export class LineageValidator {
  /**
   * Run comprehensive integrity validation across a MemoryGraph
   * @param {import('../graph/memoryGraph.js').MemoryGraph} graph
   * @param {number} duplicateEdgesRemoved
   * @returns {import('../contracts/evidenceLineageBatch.contract.js').LineageValidationSummary}
   */
  static validate(graph, duplicateEdgesRemoved = 0) {
    const nodes = graph.getAllNodes();
    const edges = graph.getAllEdges();

    let orphanCount = 0;
    let missingRefCount = 0;

    nodes.forEach((node) => {
      const incoming = graph.getIncomingEdges(node.id);
      const outgoing = graph.getOutgoingEdges(node.id);

      // Claim nodes should have outgoing edges (to evidence)
      // Evidence nodes should have incoming (from claim) and outgoing (to source)
      // Source nodes should have incoming (from evidence) and outgoing (to profile)
      // SourceProfile nodes should have incoming (from source)

      if (node.type === 'Evidence' || node.type === 'Source') {
        if (incoming.length === 0 && outgoing.length === 0) {
          orphanCount++;
        }
      }

      if (node.properties?.status === 'MISSING_EVIDENCE_PAYLOAD' || node.properties?.authorityLevel === 'UNKNOWN') {
        missingRefCount++;
      }
    });

    const hasCycle = graph.hasCycle();
    const isValid = !hasCycle && missingRefCount === 0;

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      orphanNodes: orphanCount,
      missingReferences: missingRefCount,
      duplicateEdgesRemoved,
      isValid,
    };
  }
}
