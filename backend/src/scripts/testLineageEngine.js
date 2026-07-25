/**
 * Verification & Test Suite for Phase 5 Evidence Lineage Engine
 */

import { EvidenceLineageService } from '../modules/lineage/services/evidenceLineage.service.js';
import { MemoryGraph } from '../modules/lineage/graph/memoryGraph.js';
import { GraphNodeModel } from '../modules/lineage/models/graphNode.model.js';
import { GraphEdgeModel } from '../modules/lineage/models/graphEdge.model.js';
import { GraphHasher } from '../modules/lineage/graph/graphHasher.js';
import { LineageValidator } from '../modules/lineage/validators/lineageValidator.js';
import { generateNodeId } from '../modules/lineage/utils/lineageUtils.js';

async function runLineageTestSuite() {
  console.log('\n===============================================================');
  console.log('  Phase 5 – Evidence Lineage Engine Execution Test Suite');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // --- Test Fixtures ---
  const mockEvidenceBatch = {
    batchId: 'evb_test001',
    query: 'Is mRNA vaccination effective and safe against COVID-19?',
    evidence: [
      {
        evidenceId: 'ev_101',
        text: 'Clinical trial analysis shows mRNA vaccine efficacy of 95% in preventing symptomatic disease.',
        sourceUrl: 'https://www.cdc.gov/vaccines/covid19-efficacy.html',
        relevance: 0.98,
      },
      {
        evidenceId: 'ev_102',
        text: 'Observational cohort study reports minor localized site reactions with zero major adverse events.',
        sourceUrl: 'https://www.nature.com/articles/s41586-021-0001-x',
        relevance: 0.92,
      },
      {
        evidenceId: 'ev_103',
        text: 'Unverified blog claims mRNA technology alters host genomic DNA sequence.',
        sourceUrl: 'https://healthblog-unverified-claims.org/article-99',
        relevance: 0.45,
      },
    ],
  };

  const mockVerificationBatch = {
    batchId: 'vfb_test001',
    query: 'Is mRNA vaccination effective and safe against COVID-19?',
    verifiedClaims: [
      {
        claimId: 'clm_201',
        claimStatement: 'mRNA COVID-19 vaccines demonstrate high clinical efficacy.',
        verdict: 'VERIFIED_TRUE',
        supportingEvidenceIds: ['ev_101', 'ev_102'],
        contradictingEvidenceIds: [],
      },
      {
        claimId: 'clm_202',
        claimStatement: 'mRNA vaccines alter host DNA sequence.',
        verdict: 'VERIFIED_FALSE',
        supportingEvidenceIds: ['ev_103'],
        contradictingEvidenceIds: ['ev_101'],
      },
    ],
  };

  const mockSourceAuthenticityBatch = {
    batchId: 'sab_test001',
    evaluatedSources: [
      {
        profileId: 'prof_cdc_gov',
        sourceUrl: 'https://www.cdc.gov/vaccines/covid19-efficacy.html',
        authorityLevel: 'INSTITUTIONAL_HEALTH_ORGANIZATION',
        authenticityScore: 0.98,
        tier: 'TIER_1',
      },
      {
        profileId: 'prof_nature_journal',
        sourceUrl: 'https://www.nature.com/articles/s41586-021-0001-x',
        authorityLevel: 'PEER_REVIEWED_JOURNAL',
        authenticityScore: 0.96,
        tier: 'TIER_1',
      },
    ],
  };

  // --- Test 1: Deterministic Node & Edge ID Generation ---
  console.log('--- Test 1: Deterministic Node & Edge ID Generation ---');
  const claimNodeId1 = generateNodeId('Claim', 'clm_201');
  const claimNodeId2 = generateNodeId('Claim', 'clm_201');
  assert(claimNodeId1 === 'node:claim:clm_201', 'Claim node ID uses correct format prefix');
  assert(claimNodeId1 === claimNodeId2, 'Node ID generation is 100% deterministic');

  // --- Test 2: In-Memory Graph & Adjacency List ---
  console.log('\n--- Test 2: In-Memory Graph & Adjacency List ---');
  const testGraph = new MemoryGraph();
  const nodeA = testGraph.addNode(new GraphNodeModel({ type: 'Claim', properties: { entityId: 'c1' } }));
  const nodeB = testGraph.addNode(new GraphNodeModel({ type: 'Evidence', properties: { entityId: 'e1' } }));
  testGraph.addEdge(new GraphEdgeModel({ sourceNodeId: nodeA.id, targetNodeId: nodeB.id, type: 'SUPPORTED_BY' }));

  assert(testGraph.getAllNodes().length === 2, 'Graph contains 2 nodes');
  assert(testGraph.getAllEdges().length === 1, 'Graph contains 1 directed edge');
  assert(testGraph.getOutgoingEdges(nodeA.id).length === 1, 'Node A has 1 outgoing edge');

  // --- Test 3: Deterministic Hasher Across 100 Iterations ---
  console.log('\n--- Test 3: Cryptographic Graph Hasher Determinism ---');
  const hash1 = GraphHasher.computeGraphHash(testGraph);
  let hashMismatch = false;
  for (let i = 0; i < 100; i++) {
    const hashN = GraphHasher.computeGraphHash(testGraph);
    if (hashN !== hash1) {
      hashMismatch = true;
      break;
    }
  }
  assert(!hashMismatch && hash1.length === 64, 'SHA-256 graph hash is 100% reproducible across 100 runs');

  // --- Test 4: End-to-End EvidenceLineageService Execution ---
  console.log('\n--- Test 4: End-to-End EvidenceLineageService Execution ---');
  const service = new EvidenceLineageService();
  const { batch, graph, queryEngine } = await service.constructLineage(
    mockEvidenceBatch,
    mockVerificationBatch,
    mockSourceAuthenticityBatch
  );

  assert(batch.batchId.startsWith('elb_'), 'Lineage batch has valid batch ID');
  assert(batch.totalClaims === 2, 'Lineage batch contains 2 claims');
  assert(batch.metadata.graphHash.length === 64, 'Lineage metadata contains valid 64-char SHA-256 root hash');
  assert(batch.metadata.validationSummary.totalNodes > 0, 'Graph constructed valid nodes');

  // --- Test 5: Provenance Query Engine Assertions ---
  console.log('\n--- Test 5: Provenance Query Engine Assertions ---');
  const supportingForClm201 = await queryEngine.findSupportingEvidence('clm_201');
  assert(supportingForClm201.length === 2, 'findSupportingEvidence("clm_201") returns 2 supporting evidence items');

  const claimsFromCdc = await queryEngine.findClaimsBySource('https://www.cdc.gov/vaccines/covid19-efficacy.html');
  assert(claimsFromCdc.length > 0, 'findClaimsBySource returns claims referencing CDC URL');

  const claimsContradictedByCdc = await queryEngine.findClaimsContradictedBySource('https://www.cdc.gov/vaccines/covid19-efficacy.html');
  assert(claimsContradictedByCdc.length === 1 && claimsContradictedByCdc[0].claimId === 'clm_202', 'findClaimsContradictedBySource returns claim contradicted by CDC evidence');

  const fullProvenance = await queryEngine.findCompleteProvenance('clm_201');
  assert(fullProvenance && fullProvenance.evidence.length === 2, 'findCompleteProvenance("clm_201") traverses complete provenance sub-tree');

  const multiSourceClaims = await queryEngine.findClaimsWithMultipleSources(2);
  assert(multiSourceClaims.length >= 1 && multiSourceClaims.some(c => c.claimId === 'clm_201'), 'findClaimsWithMultipleSources(2) accurately identifies multi-source claims');

  // --- Test 6: Immutability Enforcement ---
  console.log('\n--- Test 6: Graph & Batch Immutability Enforcement ---');
  let threwOnMutation = false;
  try {
    batch.lineage[0].claimId = 'MUTATED_ID';
  } catch (err) {
    threwOnMutation = true;
  }
  assert(threwOnMutation || Object.isFrozen(batch), 'Modifying frozen Lineage Batch is prohibited by immutability');

  // --- Summary ---
  console.log('\n===============================================================');
  console.log(`  Test Execution Results: ${passed} PASSED | ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLineageTestSuite().catch((err) => {
  console.error('Fatal error in lineage test runner:', err);
  process.exit(1);
});
