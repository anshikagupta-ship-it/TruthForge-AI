/**
 * Evidence Lineage Service
 * Main orchestrator service for Phase 5 Evidence Lineage Engine
 */

import { EvidenceResolver } from '../resolvers/evidenceResolver.js';
import { SourceResolver } from '../resolvers/sourceResolver.js';
import { GraphBuilder } from '../builders/graphBuilder.js';
import { LineageValidator } from '../validators/lineageValidator.js';
import { EvidenceLineageBatchModel } from '../models/evidenceLineageBatch.model.js';
import { ClaimLineageModel } from '../models/claimLineage.model.js';
import { InMemoryStorage } from '../storage/inMemoryStorage.js';
import { LineageCache } from '../cache/lineageCache.js';
import { LineageQueryEngine } from '../queries/lineageQueryEngine.js';
import { lineageConfig } from '../config/lineageConfig.js';

import { deepFreeze } from '../utils/lineageUtils.js';

export class EvidenceLineageService {
  /**
   * @param {Object} [options]
   * @param {import('../storage/storageProvider.js').StorageProvider} [options.storageProvider]
   * @param {LineageCache} [options.lineageCache]
   */
  constructor(options = {}) {
    this.storageProvider = options.storageProvider || new InMemoryStorage();
    this.lineageCache = options.lineageCache || new LineageCache();
  }

  /**
   * Primary entrypoint: Construct complete lineage graph from input batches
   * @param {Object} evidenceBatch - EvidenceBatch output from Phase 1
   * @param {Object} verificationBatch - VerificationBatch output from Phase 3
   * @param {Object} sourceAuthenticityBatch - SourceAuthenticityBatch output from Phase 4
   * @returns {Promise<{ batch: import('../contracts/evidenceLineageBatch.contract.js').EvidenceLineageBatch, graph: import('../graph/memoryGraph.js').MemoryGraph, queryEngine: LineageQueryEngine }>}
   */
  async constructLineage(evidenceBatch = {}, verificationBatch = {}, sourceAuthenticityBatch = {}) {
    const startTime = Date.now();
    const query = verificationBatch.query || evidenceBatch.query || '';

    // Log step 1: Initiated
    this.logEvent('LINEAGE_INITIATED', {
      query,
      totalVerifiedClaims: verificationBatch.verifiedClaims?.length || verificationBatch.claims?.length || 0,
    });

    // Step 1 & 2: Resolvers
    const evidenceResolver = new EvidenceResolver(evidenceBatch);
    const sourceResolver = new SourceResolver(sourceAuthenticityBatch);

    const claims = verificationBatch.verifiedClaims || verificationBatch.claims || [];

    // Step 3: Graph Construction
    const { graph, duplicateEdgesRemoved } = GraphBuilder.buildGraph({
      claims,
      evidenceResolver,
      sourceResolver,
    });

    this.logEvent('GRAPH_CREATED', {
      totalNodes: graph.getAllNodes().length,
      totalEdges: graph.getAllEdges().length,
      duplicateEdgesRemoved,
    });

    // Step 4: Validation
    const validationSummary = LineageValidator.validate(graph, duplicateEdgesRemoved);
    this.logEvent('VALIDATION_COMPLETED', { validationSummary });

    if (validationSummary.orphanNodes > 0) {
      this.logEvent('ORPHAN_DETECTED', { orphanNodes: validationSummary.orphanNodes });
    }
    if (duplicateEdgesRemoved > 0) {
      this.logEvent('DUPLICATE_REMOVED', { duplicateEdgesRemoved });
    }

    // Step 5: Build ClaimLineage array for output batch contract
    const claimLineages = claims.map((claim) => {
      const claimId = String(claim.claimId || claim.id);
      const { supporting, contradicting } = evidenceResolver.resolveClaimEvidence(claim);

      const supportingEvidence = supporting.map((ev) => ({
        evidenceId: ev.evidenceId,
        sourceId: sourceResolver.resolveSourceId(ev.sourceUrl),
        sourceUrl: ev.sourceUrl,
        relationship: 'SUPPORTS',
        relevance: ev.relevance,
      }));

      const contradictingEvidence = contradicting.map((ev) => ({
        evidenceId: ev.evidenceId,
        sourceId: sourceResolver.resolveSourceId(ev.sourceUrl),
        sourceUrl: ev.sourceUrl,
        relationship: 'CONTRADICTED_BY',
        relevance: ev.relevance,
      }));

      const profileIds = new Set();
      [...supporting, ...contradicting].forEach((ev) => {
        const prof = sourceResolver.resolveProfile(ev.sourceUrl);
        if (prof && (prof.profileId || prof.id)) {
          profileIds.add(prof.profileId || prof.id);
        } else {
          profileIds.add(lineageConfig.fallbackNodePrefixes.unknownProfile + sourceResolver.resolveSourceId(ev.sourceUrl));
        }
      });

      return new ClaimLineageModel({
        claimId,
        supportingEvidence,
        contradictingEvidence,
        sourceProfiles: Array.from(profileIds),
      }).toJSON();
    });

    // Step 6: Freezing & Hashing
    const { frozenGraph, graphHash } = GraphBuilder.freezeGraph(graph);
    this.logEvent('GRAPH_FROZEN', { graphHash });

    const executionTimeMs = Date.now() - startTime;

    // Step 7: Create Batch Output Model
    const batchModel = new EvidenceLineageBatchModel({
      query,
      lineage: claimLineages,
      metadata: {
        generatedAt: new Date().toISOString(),
        generatorVersion: lineageConfig.generatorVersion,
        graphVersion: lineageConfig.graphVersion,
        graphHash,
        executionTimeMs,
        validationSummary,
      },
    });

    const batch = batchModel.toJSON();

    if (lineageConfig.enableImmutabilityFreezing) {
      deepFreeze(batch);
    }

    // Step 8: Storage & Caching
    await this.storageProvider.saveGraph(batch, frozenGraph);
    await this.lineageCache.cacheBatch(batch);

    const queryEngine = new LineageQueryEngine(frozenGraph, batch);

    this.logEvent('LINEAGE_CREATED', {
      batchId: batch.batchId,
      totalClaims: batch.totalClaims,
      executionTimeMs,
      isValid: validationSummary.isValid,
    });

    return { batch, graph: frozenGraph, queryEngine };
  }

  /**
   * Structured JSON Logger Helper
   * @param {string} event
   * @param {Record<string, any>} payload
   */
  logEvent(event, payload = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      stage: 'Evidence Lineage',
      event,
      ...payload,
    };
    console.log(JSON.stringify(logEntry));
  }
}
