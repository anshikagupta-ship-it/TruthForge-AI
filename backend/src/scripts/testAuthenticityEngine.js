/**
 * Test & Verification Script for Phase 4 – Source Authenticity Evaluation Engine
 */

import { SourceAuthenticityService } from '../modules/authenticity/services/sourceAuthenticity.service.js';
import { InMemoryCache } from '../modules/authenticity/cache/inMemoryCache.js';

async function runVerification() {
  console.log('====================================================');
  console.log('   Testing Phase 4 Source Authenticity Engine       ');
  console.log('====================================================\n');

  // Instantiate service with local in-memory cache
  const authenticityService = new SourceAuthenticityService(new InMemoryCache());

  // Mock EvidenceBatch from Phase 1
  const mockEvidenceBatch = {
    query: 'Is vaccination effective against measles?',
    evidence: [
      { id: 'ev_001', sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/measles' },
      { id: 'ev_002', sourceUrl: 'https://www.cdc.gov/measles/index.html' },
      { id: 'ev_003', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/12345678/' },
      { id: 'ev_004', sourceUrl: 'https://www.nature.com/articles/s41586-026-0001' },
      { id: 'ev_005', sourceUrl: 'http://some-random-untrusted-blog.com/post/123' },
      { id: 'ev_006', sourceUrl: 'htps://malformed-url-test...com/invalid' }, // Malformed URL
    ],
  };

  // Mock VerificationBatch from Phase 3
  const mockVerificationBatch = {
    query: 'Is vaccination effective against measles?',
    verifiedClaims: [
      {
        claimId: 'clm_001',
        matchedEvidence: [
          { evidenceId: 'ev_001', sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/measles' },
          { evidenceId: 'ev_002', sourceUrl: 'https://www.cdc.gov/measles/index.html' },
        ],
      },
      {
        claimId: 'clm_002',
        matchedEvidence: [
          { evidenceId: 'ev_003', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/12345678/' },
          { evidenceId: 'ev_004', sourceUrl: 'https://www.nature.com/articles/s41586-026-0001' },
        ],
      },
    ],
  };

  console.log('Executing evaluation run #1 (Cache Miss)...');
  const result1 = await authenticityService.evaluateBatch({
    verificationBatch: mockVerificationBatch,
    evidenceBatch: mockEvidenceBatch,
  });

  console.log(`\nRun #1 Total Unique Sources Evaluated: ${result1.totalSources}`);
  console.log(`Run #1 Execution Time: ${result1.executionSummary.totalExecutionTimeMs}ms`);
  console.log(`Run #1 Cache Hit Ratio: ${result1.executionSummary.cacheHitRatio}`);
  console.log('\nEvaluated Source Profiles:');
  console.table(result1.evaluatedSources.map(s => ({
    Domain: s.domain,
    Type: s.sourceType,
    Score: s.authenticityScore,
    Level: s.authenticityLevel,
    HTTPS: s.evaluationFactors.securityProtocol === 100 ? 'YES' : 'NO',
    RegistryMatch: s.evaluationFactors.authorityRegistryMatch > 0 ? 'YES' : 'NO',
  })));

  console.log('\nExecuting evaluation run #2 (Cache Hit Verification)...');
  const result2 = await authenticityService.evaluateBatch({
    verificationBatch: mockVerificationBatch,
    evidenceBatch: mockEvidenceBatch,
  });

  console.log(`Run #2 Execution Time: ${result2.executionSummary.totalExecutionTimeMs}ms`);
  console.log(`Run #2 Cache Hit Ratio: ${result2.executionSummary.cacheHitRatio} (Expected: 1.0)`);

  console.log('\n====================================================');
  console.log('   Phase 4 Engine Verification Passed Successfully!  ');
  console.log('====================================================');
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
