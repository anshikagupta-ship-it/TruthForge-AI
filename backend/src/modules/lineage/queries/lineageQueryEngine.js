/**
 * Lineage Query Engine Implementation
 */

import { LineageQueryInterface } from './lineageQueryInterface.js';
import { generateNodeId } from '../utils/lineageUtils.js';

export class LineageQueryEngine extends LineageQueryInterface {
  /**
   * @param {import('../graph/memoryGraph.js').MemoryGraph} graph
   * @param {import('../contracts/evidenceLineageBatch.contract.js').EvidenceLineageBatch} batch
   */
  constructor(graph, batch) {
    super();
    this.graph = graph;
    this.batch = batch;
  }

  async findSupportingEvidence(claimId) {
    const claimNodeId = generateNodeId('Claim', claimId);
    const outgoing = this.graph.getOutgoingEdges(claimNodeId);

    const supportingEdges = outgoing.filter((e) => e.type === 'SUPPORTED_BY');
    return supportingEdges.map((e) => {
      const evNode = this.graph.getNode(e.targetNodeId);
      const evFromEdges = this.graph.getOutgoingEdges(e.targetNodeId).filter((edge) => edge.type === 'FROM');
      const sourceNodeId = evFromEdges.length > 0 ? evFromEdges[0].targetNodeId : null;
      const sourceNode = sourceNodeId ? this.graph.getNode(sourceNodeId) : null;

      return {
        evidenceId: evNode?.properties?.evidenceId || e.targetNodeId,
        sourceId: sourceNode?.properties?.sourceId || 'src_unknown',
        sourceUrl: evNode?.properties?.sourceUrl || sourceNode?.properties?.sourceUrl || '',
        relationship: 'SUPPORTS',
        relevance: e.properties?.relevance || 1.0,
      };
    });
  }

  async findClaimsBySource(sourceIdOrUrl) {
    const matchingClaims = [];
    const sourceNodeId = generateNodeId('Source', sourceIdOrUrl);
    const sourceNode = this.graph.getNode(sourceNodeId) || Array.from(this.graph.nodes.values()).find((n) => n.type === 'Source' && (n.properties?.sourceId === sourceIdOrUrl || n.properties?.sourceUrl === sourceIdOrUrl));

    if (!sourceNode) return [];

    const incomingToSource = this.graph.getIncomingEdges(sourceNode.id).filter((e) => e.type === 'FROM');
    const evidenceIds = incomingToSource.map((e) => e.sourceNodeId);

    evidenceIds.forEach((evId) => {
      const incomingToEv = this.graph.getIncomingEdges(evId).filter((e) => e.type === 'SUPPORTED_BY' || e.type === 'CONTRADICTED_BY');
      incomingToEv.forEach((e) => {
        const claimNode = this.graph.getNode(e.sourceNodeId);
        if (claimNode && claimNode.properties?.claimId) {
          const claimLineage = this.batch.lineage.find((l) => l.claimId === claimNode.properties.claimId);
          if (claimLineage && !matchingClaims.includes(claimLineage)) {
            matchingClaims.push(claimLineage);
          }
        }
      });
    });

    return matchingClaims;
  }

  async findClaimsContradictedBySource(sourceIdOrUrl) {
    const matchingClaims = [];
    const sourceNode = Array.from(this.graph.nodes.values()).find((n) => n.type === 'Source' && (n.properties?.sourceId === sourceIdOrUrl || n.properties?.sourceUrl === sourceIdOrUrl || n.id === generateNodeId('Source', sourceIdOrUrl)));

    if (!sourceNode) return [];

    const incomingToSource = this.graph.getIncomingEdges(sourceNode.id).filter((e) => e.type === 'FROM');
    const evidenceIds = incomingToSource.map((e) => e.sourceNodeId);

    evidenceIds.forEach((evId) => {
      const incomingToEv = this.graph.getIncomingEdges(evId).filter((e) => e.type === 'CONTRADICTED_BY');
      incomingToEv.forEach((e) => {
        const claimNode = this.graph.getNode(e.sourceNodeId);
        if (claimNode && claimNode.properties?.claimId) {
          const claimLineage = this.batch.lineage.find((l) => l.claimId === claimNode.properties.claimId);
          if (claimLineage && !matchingClaims.includes(claimLineage)) {
            matchingClaims.push(claimLineage);
          }
        }
      });
    });

    return matchingClaims;
  }

  async findCompleteProvenance(claimId) {
    const claimNodeId = generateNodeId('Claim', claimId);
    const claimNode = this.graph.getNode(claimNodeId);
    if (!claimNode) return null;

    const reachableNodes = this.graph.getReachableNodes(claimNodeId);
    const reachableNodeIds = new Set(reachableNodes.map((n) => n.id));

    const edges = this.graph
      .getAllEdges()
      .filter((e) => reachableNodeIds.has(e.sourceNodeId) && reachableNodeIds.has(e.targetNodeId));

    return {
      claim: claimNode,
      evidence: reachableNodes.filter((n) => n.type === 'Evidence'),
      sources: reachableNodes.filter((n) => n.type === 'Source'),
      profiles: reachableNodes.filter((n) => n.type === 'SourceProfile'),
      edges,
    };
  }

  async findClaimsByAuthority(authorityName) {
    const cleanAuthority = String(authorityName).trim().toLowerCase();
    const matchingProfiles = Array.from(this.graph.nodes.values()).filter((n) => n.type === 'SourceProfile' && String(n.properties?.authorityLevel || n.properties?.institution || '').toLowerCase().includes(cleanAuthority));

    const matchingClaims = [];
    for (const profNode of matchingProfiles) {
      const incomingToProf = this.graph.getIncomingEdges(profNode.id).filter((e) => e.type === 'HAS_PROFILE');
      for (const edge of incomingToProf) {
        const sourceNode = this.graph.getNode(edge.sourceNodeId);
        if (sourceNode) {
          const claims = await this.findClaimsBySource(sourceNode.properties?.sourceUrl || sourceNode.id);
          claims.forEach((c) => {
            if (!matchingClaims.includes(c)) matchingClaims.push(c);
          });
        }
      }
    }
    return matchingClaims;
  }

  async findEvidenceByDomain(domain) {
    const cleanDomain = String(domain).trim().toLowerCase();
    return Array.from(this.graph.nodes.values()).filter((n) => n.type === 'Evidence' && String(n.properties?.sourceUrl || '').toLowerCase().includes(cleanDomain));
  }

  async findClaimsWithMultipleSources(minSources = 2) {
    return this.batch.lineage.filter((claimLineage) => {
      const allEvidence = [...claimLineage.supportingEvidence, ...claimLineage.contradictingEvidence];
      const uniqueSources = new Set(allEvidence.map((ev) => ev.sourceUrl || ev.sourceId));
      return uniqueSources.size >= minSources;
    });
  }
}
