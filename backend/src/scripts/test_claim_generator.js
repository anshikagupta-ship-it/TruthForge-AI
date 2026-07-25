import { ClaimGeneratorService } from '../modules/claims/services/claimGenerator.service.js';
import { TextNormalizer } from '../modules/claims/utils/textNormalizer.js';
import { ClaimDeduplicator } from '../modules/claims/utils/claimDeduplicator.js';
import { SchemaValidator } from '../modules/claims/validators/schemaValidator.js';
import { LineageValidator } from '../modules/claims/validators/lineageValidator.js';
import { ContentValidator } from '../modules/claims/validators/contentValidator.js';
import { JsonResponseParser } from '../modules/claims/parsers/jsonResponseParser.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING CLAIM GENERATOR SUITE (PHASE 2 TESTS)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  // TEST 1: TextNormalizer & Jaccard Similarity
  console.log('Test Group 1: Utilities (TextNormalizer)');
  const str1 = 'Unsafe water spreads infectious diseases.';
  const str2 = 'Unsafe water spreads infectious disease transmission.';
  const sim = TextNormalizer.calculateJaccardSimilarity(str1, str2);
  assert(sim > 0.7, `Jaccard similarity calculation (got: ${sim.toFixed(2)})`);

  // TEST 2: JsonResponseParser (Handling Markdown Code Blocks & Preambles)
  console.log('\nTest Group 2: Parsers (JsonResponseParser)');
  const rawMarkdown = 'Here is your JSON:\n```json\n{"extractedClaims": [{"statement": "Fact A", "supportingEvidenceIds": ["ev-1"]}]}\n```';
  const parsed = JsonResponseParser.parse(rawMarkdown);
  assert(parsed.extractedClaims?.length === 1, 'Markdown code fence stripping & parsing');

  // TEST 3: Validators (Schema, Lineage, Content)
  console.log('\nTest Group 3: Validators');
  const validSchema = SchemaValidator.validate({ statement: 'Test statement here', supportingEvidenceIds: ['ev-1'] });
  assert(validSchema.isValid, 'SchemaValidator approves valid candidate');

  const invalidSchema = SchemaValidator.validate({ statement: '', supportingEvidenceIds: [] });
  assert(!invalidSchema.isValid, 'SchemaValidator rejects empty candidate');

  const validEvMap = new Map([['ev-1', { evidenceId: 'ev-1', sourceDomain: 'who.int' }]]);
  const lineage = LineageValidator.validateEvidenceLineage(['ev-1', 'ev-hallucinated'], validEvMap);
  assert(lineage.validIds.length === 1 && lineage.validIds[0] === 'ev-1', 'LineageValidator strips hallucinated evidence ID');

  const contentVal = ContentValidator.validateContent('In my opinion water is probably good');
  assert(!contentVal.isValid, 'ContentValidator rejects speculative statement');

  // TEST 4: ClaimDeduplicator
  console.log('\nTest Group 4: Deduplication');
  const candidateClaims = [
    {
      claimId: 'c1',
      statement: 'Contaminated water spreads infectious diseases.',
      supportingEvidenceIds: ['ev-1'],
      sourceDomains: ['cdc.gov'],
      metadata: { evidenceCount: 1, sourceCount: 1, deduplicatedFromCount: 1 },
    },
    {
      claimId: 'c2',
      statement: 'Contaminated water spreads infectious disease.',
      supportingEvidenceIds: ['ev-2'],
      sourceDomains: ['who.int'],
      metadata: { evidenceCount: 1, sourceCount: 1, deduplicatedFromCount: 1 },
    },
  ];
  const dedupRes = ClaimDeduplicator.deduplicate(candidateClaims, 0.80);
  assert(dedupRes.deduplicatedClaims.length === 1, 'Deduplicates semantically identical claims');
  assert(dedupRes.deduplicatedClaims[0].supportingEvidenceIds.length === 2, 'Unions evidence IDs across merged claims');
  assert(dedupRes.deduplicatedClaims[0].sourceDomains.length === 2, 'Unions source domains across merged claims');

  // TEST 5: End-to-End Claim Generator Service
  console.log('\nTest Group 5: End-to-End Service Execution');
  const mockEvidenceBatch = {
    batchId: 'eb-100',
    queryId: 'q-test-1',
    query: 'What are the risks of contaminated water?',
    evidences: [
      {
        evidenceId: 'evidence-1',
        text: 'Contaminated water spreads infectious diseases worldwide.',
        sourceUrl: 'https://who.int/water',
        sourceDomain: 'who.int',
        semanticScore: 0.95,
        retrievalScore: 1,
      },
      {
        evidenceId: 'evidence-2',
        text: 'Poor water quality negatively affects agricultural production and food security.',
        sourceUrl: 'https://fao.org/water',
        sourceDomain: 'fao.org',
        semanticScore: 0.88,
        retrievalScore: 2,
      },
    ],
  };

  const mockEvidenceProfile = {
    profileId: 'ep-100',
    batchId: 'eb-100',
    totalEvidences: 2,
    distinctSourcesCount: 2,
    qualityWarnings: [],
  };

  const claimBatch = await ClaimGeneratorService.generateClaims(mockEvidenceBatch, mockEvidenceProfile);
  assert(claimBatch.batchId.startsWith('cb-'), 'Generates valid ClaimBatch with batchId');
  assert(claimBatch.query === mockEvidenceBatch.query, 'Preserves original user query');
  assert(claimBatch.totalClaims > 0, 'Generates claims array');
  assert(claimBatch.claims[0].supportingEvidenceIds.length > 0, 'Every claim references valid evidence IDs');
  assert(claimBatch.claims[0].sourceDomains.length > 0, 'Every claim references valid source domains');

  // TEST 6: Empty Evidence Guard
  const emptyBatch = await ClaimGeneratorService.generateClaims({ queryId: 'q-empty', query: 'Empty query', evidences: [] });
  assert(emptyBatch.totalClaims === 0, 'Handles empty evidence batch gracefully without errors');

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} Passed | ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
