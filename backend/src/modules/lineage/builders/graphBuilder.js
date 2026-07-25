/**
 * Graph Builder
 * Orchestrates deterministic node and edge creation in strict order, applies graph freezing and hashing
 */

import { MemoryGraph } from '../graph/memoryGraph.js';
import { GraphNodeModel } from '../models/graphNode.model.js';
import { RelationshipBuilder } from './relationshipBuilder.js';
import { generateNodeId, deepFreeze } from '../utils/lineageUtils.js';
import { lineageConfig } from '../config/lineageConfig.js';
import { GraphHasher } from '../graph/graphHasher.js';

export class GraphBuilder {
  /**
   * Orchestrate full graph construction from resolved items
   * @param {Object} params
   * @param {Object[]} params.claims - Array of claim entities
   * @param {import('../resolvers/evidenceResolver.js').EvidenceResolver} params.evidenceResolver
   * @param {import('../resolvers/sourceResolver.js').SourceResolver} params.sourceResolver
   * @returns {{ graph: MemoryGraph, duplicateEdgesRemoved: number }}
   */
  static buildGraph({ claims = [], evidenceResolver, sourceResolver }) {
    const graph = new MemoryGraph();
    let duplicateEdgesRemoved = 0;

    // Step A: Create Claim Nodes
    claims.forEach((claim) => {
      const claimId = claim.claimId || claim.id;
      if (claimId) {
        graph.addNode(
          new GraphNodeModel({
            type: 'Claim',
            label: `Claim (${claimId})`,
            properties: {
              claimId: String(claimId),
              statement: claim.claimStatement || claim.statement || '',
              verdict: claim.verdict || claim.classification || 'UNVERIFIED',
            },
          })
        );
      }
    });

    // Collect all referenced evidence IDs & source URLs
    const referencedEvidenceMap = new Map();
    const referencedSourcesMap = new Map();
    const referencedProfilesMap = new Map();

    claims.forEach((claim) => {
      const claimId = claim.claimId || claim.id;
      const { supporting, contradicting } = evidenceResolver.resolveClaimEvidence(claim);

      [...supporting, ...contradicting].forEach((ev) => {
        if (!referencedEvidenceMap.has(ev.evidenceId)) {
          referencedEvidenceMap.set(ev.evidenceId, ev);
        }

        const sourceUrl = ev.sourceUrl || 'unknown://source';
        const sourceId = sourceResolver.resolveSourceId(sourceUrl);
        referencedSourcesMap.set(sourceUrl, { sourceUrl, sourceId });

        const profile = sourceResolver.resolveProfile(sourceUrl) || {
          profileId: lineageConfig.fallbackNodePrefixes.unknownProfile + sourceId,
          sourceUrl,
          authorityLevel: 'UNKNOWN',
          authenticityScore: 0.5,
        };
        referencedProfilesMap.set(profile.profileId || profile.id, profile);
      });
    });

    // Step B: Create Evidence Nodes
    referencedEvidenceMap.forEach((ev) => {
      graph.addNode(
        new GraphNodeModel({
          type: 'Evidence',
          label: `Evidence (${ev.evidenceId})`,
          properties: {
            evidenceId: ev.evidenceId,
            text: ev.text,
            sourceUrl: ev.sourceUrl,
            relevance: ev.relevance,
          },
        })
      );
    });

    // Step C: Create Source Nodes
    referencedSourcesMap.forEach(({ sourceUrl, sourceId }) => {
      graph.addNode(
        new GraphNodeModel({
          type: 'Source',
          label: `Source (${sourceId})`,
          properties: {
            sourceId,
            sourceUrl,
          },
        })
      );
    });

    // Step D: Create SourceProfile Nodes
    referencedProfilesMap.forEach((profile) => {
      const profileId = profile.profileId || profile.id || 'prof_unknown';
      graph.addNode(
        new GraphNodeModel({
          type: 'SourceProfile',
          label: `Profile (${profileId})`,
          properties: {
            profileId,
            sourceUrl: profile.sourceUrl || '',
            authorityLevel: profile.authorityLevel || 'UNKNOWN',
            authenticityScore: typeof profile.authenticityScore === 'number' ? profile.authenticityScore : 0.5,
            tier: profile.tier || 'UNCLASSIFIED',
          },
        })
      );
    });

    // Step E: Connect All Directed Edges
    claims.forEach((claim) => {
      const claimId = String(claim.claimId || claim.id);
      const { supporting, contradicting } = evidenceResolver.resolveClaimEvidence(claim);

      // Supporting Edges
      supporting.forEach((ev) => {
        try {
          RelationshipBuilder.addSupportedByEdge(graph, claimId, ev.evidenceId, ev.relevance);
        } catch (err) {
          if (err.message.includes('already exists')) duplicateEdgesRemoved++;
        }
      });

      // Contradicting Edges
      contradicting.forEach((ev) => {
        try {
          RelationshipBuilder.addContradictedByEdge(graph, claimId, ev.evidenceId, ev.relevance);
        } catch (err) {
          if (err.message.includes('already exists')) duplicateEdgesRemoved++;
        }
      });
    });

    // Evidence -> Source & Source -> SourceProfile Edges
    referencedEvidenceMap.forEach((ev) => {
      const sourceUrl = ev.sourceUrl || 'unknown://source';
      RelationshipBuilder.addFromEdge(graph, ev.evidenceId, sourceUrl);

      const profile = sourceResolver.resolveProfile(sourceUrl) || {
        profileId: lineageConfig.fallbackNodePrefixes.unknownProfile + sourceResolver.resolveSourceId(sourceUrl),
      };
      const profileId = profile.profileId || profile.id || 'prof_unknown';

      try {
        RelationshipBuilder.addHasProfileEdge(graph, sourceUrl, profileId);
      } catch (err) {
        // Edge already created for this source
      }
    });

    return { graph, duplicateEdgesRemoved };
  }

  /**
   * Freeze graph objects and assign cryptographic hash
   * @param {MemoryGraph} graph
   * @returns {{ frozenGraph: MemoryGraph, graphHash: string }}
   */
  static freezeGraph(graph) {
    const graphHash = GraphHasher.computeGraphHash(graph);
    if (lineageConfig.enableImmutabilityFreezing) {
      deepFreeze(graph);
    }
    return { frozenGraph: graph, graphHash };
  }
}
