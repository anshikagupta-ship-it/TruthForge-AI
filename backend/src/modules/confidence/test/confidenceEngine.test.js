/**
 * Deterministic Test & Verification Script for Phase 6 Explainable Confidence Engine
 */

import { ConfidenceEngineService } from '../services/confidenceEngine.service.js';
import crypto from 'node:crypto';

async function runVerification() {
  console.log('=== Starting Phase 6 Explainable Confidence Engine Verification ===\n');

  const engine = new ConfidenceEngineService();

  // Mock Inputs
  const mockVerificationBatch = {
    batchId: 'vbatch_101',
    query: 'What are the main causes of climate change?',
    claims: [
      {
        claimId: 'claim_climate_001',
        statement: 'Human activities are the primary driver of global climate change.',
        status: 'SUPPORTED',
        supportingEvidenceIds: ['ev_cdc_01', 'ev_who_02', 'ev_nasa_03', 'ev_ipcc_04', 'ev_nature_05'],
        contradictingEvidenceIds: [],
        coverageRatio: 1.0,
      },
      {
        claimId: 'claim_climate_002',
        statement: 'Solar flares have a larger impact than greenhouse gases.',
        status: 'CONTRADICTED',
        supportingEvidenceIds: ['ev_blog_01'],
        contradictingEvidenceIds: ['ev_nasa_03', 'ev_ipcc_04'],
        coverageRatio: 0.5,
      },
    ],
  };

  const mockEvidenceBatch = {
    batchId: 'ebatch_101',
    evidence: [
      { evidenceId: 'ev_cdc_01', sourceUrl: 'https://www.cdc.gov/climateandhealth', retrievalScore: 92 },
      { evidenceId: 'ev_who_02', sourceUrl: 'https://www.who.int/news-room/fact-sheets/climate', retrievalScore: 95 },
      { evidenceId: 'ev_nasa_03', sourceUrl: 'https://climate.nasa.gov/causes', retrievalScore: 98 },
      { evidenceId: 'ev_ipcc_04', sourceUrl: 'https://www.ipcc.ch/report/ar6', retrievalScore: 96 },
      { evidenceId: 'ev_nature_05', sourceUrl: 'https://www.nature.com/articles/s41558', retrievalScore: 90 },
      { evidenceId: 'ev_blog_01', sourceUrl: 'http://someblog.wordpress.com/post1', retrievalScore: 40 },
    ],
  };

  const mockEvidenceProfile = {
    claim_climate_001: { semanticScore: 95 },
    claim_climate_002: { semanticScore: 45 },
  };

  const mockSourceAuthenticityBatch = {
    profiles: [
      { domain: 'cdc.gov', authenticityScore: 98, authenticityLevel: 'VERY_HIGH', sourceType: 'Government' },
      { domain: 'who.int', authenticityScore: 96, authenticityLevel: 'VERY_HIGH', sourceType: 'International Organization' },
      { domain: 'climate.nasa.gov', authenticityScore: 99, authenticityLevel: 'VERY_HIGH', sourceType: 'Government' },
      { domain: 'ipcc.ch', authenticityScore: 97, authenticityLevel: 'VERY_HIGH', sourceType: 'Scientific Panel' },
      { domain: 'nature.com', authenticityScore: 95, authenticityLevel: 'VERY_HIGH', sourceType: 'Academic Journal' },
      { domain: 'someblog.wordpress.com', authenticityScore: 20, authenticityLevel: 'VERY_LOW', sourceType: 'Unknown' },
    ],
  };

  const mockEvidenceLineageBatch = {
    status: 'COMPLETE',
    claimLineages: [
      { claimId: 'claim_climate_001', missingProfileCount: 0 },
      { claimId: 'claim_climate_002', missingProfileCount: 0 },
    ],
  };

  const inputs = {
    VerificationBatch: mockVerificationBatch,
    EvidenceBatch: mockEvidenceBatch,
    EvidenceProfile: mockEvidenceProfile,
    SourceAuthenticityBatch: mockSourceAuthenticityBatch,
    EvidenceLineageBatch: mockEvidenceLineageBatch,
  };

  // Run 1
  const result1 = await engine.computeConfidenceBatch(inputs);

  console.log('\n--- Output Batch Summary ---');
  console.log(`Batch ID: ${result1.batchId}`);
  console.log(`Total Claims: ${result1.totalClaims}`);

  for (const c of result1.claims) {
    console.log(`\nClaim ID: ${c.claimId}`);
    console.log(`Score: ${c.confidenceScore} (${c.confidenceLevel})`);
    console.log('Factors:', JSON.stringify(c.confidenceFactors, null, 2));
    console.log('Explanation Strengths:', c.explanation.strengths);
    console.log('Explanation Penalties:', c.explanation.penalties);
    console.log('Explanation Reasons:', c.explanation.reasons);
  }

  // Determinism Check (Run 10 times and verify identical hash)
  console.log('\n--- Running Determinism Verification (10 consecutive runs) ---');
  const hashes = new Set();
  const outputs = [];

  for (let i = 0; i < 10; i++) {
    // Clear cache to force clean computation
    engine.cache.clear();
    const res = await engine.computeConfidenceBatch(inputs);
    
    // Sanitize timestamp & execution time metrics for pure output equivalence
    const sanitized = JSON.parse(JSON.stringify(res));
    delete sanitized.metadata.processedAt;
    delete sanitized.metadata.totalExecutionTimeMs;
    for (const claim of sanitized.claims) {
      delete claim.metadata.evaluatedAt;
      delete claim.metadata.executionTimeMs;
    }

    const jsonStr = JSON.stringify(sanitized);
    const hash = crypto.createHash('sha256').update(jsonStr).digest('hex');
    hashes.add(hash);
    outputs.push(jsonStr);
  }

  if (hashes.size === 1) {
    console.log('✅ DETERMINISM SUCCESSFUL: 10/10 runs produced 100% byte-identical output hash!');
  } else {
    console.error(`❌ DETERMINISM FAILED: Got ${hashes.size} distinct hashes across 10 runs`);
    console.log('Output 0:', outputs[0]);
    console.log('Output 1:', outputs[1]);
    process.exit(1);
  }

  console.log('\n=== Verification Completed Successfully ===');
}

runVerification().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
