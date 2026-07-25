/**
 * Unit & Integration Test Suite for Phase 3 - Claim Verification Module
 * Runs comprehensive verification checks on all components and orchestrator services.
 */

import { EvidenceResolver } from '../modules/verification/resolvers/evidenceResolver.js';
import { VerificationContextBuilder } from '../modules/verification/resolvers/verificationContextBuilder.js';
import { PromptRegistry } from '../modules/verification/prompts/promptRegistry.js';
import { JsonResponseParser } from '../modules/verification/parsers/jsonResponseParser.js';
import { SchemaValidator } from '../modules/verification/validators/schemaValidator.js';
import { EvidenceValidator } from '../modules/verification/validators/evidenceValidator.js';
import { ContentValidator } from '../modules/verification/validators/contentValidator.js';
import { ClaimVerificationService } from '../modules/verification/services/claimVerification.service.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('TRUTHFORGE-AI: PHASE 3 CLAIM VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  // TEST 1: EvidenceResolver
  console.log('--- TEST 1: EvidenceResolver ---');
  const sampleEvidences = [
    { evidenceId: 'ev-1', contentSnippet: 'Contaminated drinking water leads to cholera outbreaks.', sourceUrl: 'https://who.int/water', retrievalScore: 0.95 },
    { evidenceId: 'ev-2', contentSnippet: 'Boiling water for 1 minute kills bacteria and pathogens.', sourceUrl: 'https://cdc.gov/water', retrievalScore: 0.92 },
    { evidenceId: 'ev-3', contentSnippet: 'Solar panels generate clean electricity.', sourceUrl: 'https://energy.gov/solar', retrievalScore: 0.40 },
  ];

  const resolved = EvidenceResolver.resolve(sampleEvidences, ['ev-1', 'ev-2']);
  assert(resolved.length === 2, 'Resolved exactly 2 matching evidence items');
  assert(resolved[0].evidenceId === 'ev-1', 'First resolved evidence ID is ev-1');
  assert(resolved[0].domain === 'who.int', 'Extracted domain correctly from URL');

  // TEST 2: VerificationContextBuilder
  console.log('\n--- TEST 2: VerificationContextBuilder ---');
  const context = VerificationContextBuilder.buildContext({ claimId: 'clm-1', statement: 'Water boils' }, resolved);
  assert(context.includes('EVIDENCE ITEM #1 [ID: ev-1]'), 'Contains formatted evidence block');
  assert(context.includes('Contaminated drinking water'), 'Contains snippet text');

  // TEST 3: PromptRegistry
  console.log('\n--- TEST 3: PromptRegistry Domain Routing ---');
  const sysGeneral = PromptRegistry.getSystemPrompt('general');
  const sysMedical = PromptRegistry.getSystemPrompt('medical');
  assert(sysGeneral.includes('CLOSED WORLD EVALUATION'), 'General prompt enforces closed-world rule');
  assert(sysMedical.includes('MEDICAL DOMAIN PRECISION'), 'Medical prompt includes clinical trial precision rules');

  // TEST 4: JsonResponseParser
  console.log('\n--- TEST 4: JsonResponseParser ---');
  const rawWithFence = '```json\n{\n  "status": "SUPPORTED",\n  "reason": "Direct match."\n}\n```';
  const parsed = JsonResponseParser.parse(rawWithFence);
  assert(parsed.status === 'SUPPORTED', 'Stripped markdown fence and parsed JSON');

  // TEST 5: Validators & Hallucination Detection
  console.log('\n--- TEST 5: Multi-Level Validators & Hallucination Detection ---');
  const schemaRes = SchemaValidator.validate({ status: 'SUPPORTED', reason: 'Valid explanation string.' });
  assert(schemaRes.isValid === true, 'SchemaValidator approves valid payload');

  const invalidSchema = SchemaValidator.validate({ status: 'INVALID_STATUS', reason: 'Short' });
  assert(invalidSchema.isValid === false, 'SchemaValidator rejects invalid enum status');

  const evidenceCheck = EvidenceValidator.validate(
    { supportingEvidenceIds: ['ev-1', 'ev-999'] }, // ev-999 does not exist
    sampleEvidences
  );
  assert(evidenceCheck.isValid === false, 'EvidenceValidator rejects hallucinated ID ev-999');
  assert(evidenceCheck.invalidIds.includes('ev-999'), 'Identifies invalid ID ev-999');
  assert(evidenceCheck.cleanedSupporting.length === 1, 'Kept valid ID ev-1');

  const contentCheck = ContentValidator.validate({ status: 'SUPPORTED', reason: 'Proper reason length test string.' });
  assert(contentCheck.isValid === true, 'ContentValidator approves valid reason length');

  // TEST 6: End-to-End ClaimVerificationService Execution
  console.log('\n--- TEST 6: ClaimVerificationService End-to-End Execution ---');

  const evidenceBatch = {
    batchId: 'eb-test-1',
    queryId: 'q-test-1',
    query: 'Is contaminated water dangerous to human health?',
    evidences: sampleEvidences,
  };

  const claimBatch = {
    batchId: 'cb-test-1',
    queryId: 'q-test-1',
    query: 'Is contaminated water dangerous to human health?',
    totalClaims: 3,
    claims: [
      {
        claimId: 'clm-101',
        statement: 'Contaminated drinking water spreads infectious diseases.',
        supportingEvidenceIds: ['ev-1'],
      },
      {
        claimId: 'clm-102',
        statement: 'Boiling water for 1 minute eliminates harmful pathogens.',
        supportingEvidenceIds: ['ev-2'],
      },
      {
        claimId: 'clm-103',
        statement: 'Nuclear fusion powers commercial airlines.',
        supportingEvidenceIds: ['ev-3'],
      },
    ],
  };

  // Mock Provider returning realistic JSON for each claim
  const mockProvider = {
    providerName: 'mock/unit-test',
    async generateJson(systemPrompt, userPrompt) {
      if (userPrompt.includes('Contaminated drinking water')) {
        return {
          rawResponse: JSON.stringify({
            status: 'SUPPORTED',
            reason: 'The evidence explicitly states that contaminated drinking water leads to cholera outbreaks.',
            supportingEvidenceIds: ['ev-1'],
            contradictingEvidenceIds: [],
            matchedEvidence: [{ evidenceId: 'ev-1', relevance: 0.95, notes: 'Direct match' }],
          }),
        };
      } else if (userPrompt.includes('Boiling water')) {
        return {
          rawResponse: JSON.stringify({
            status: 'SUPPORTED',
            reason: 'The evidence confirms boiling water for 1 minute kills bacteria and pathogens.',
            supportingEvidenceIds: ['ev-2'],
            contradictingEvidenceIds: [],
            matchedEvidence: [{ evidenceId: 'ev-2', relevance: 0.92, notes: 'Kills pathogens' }],
          }),
        };
      } else {
        return {
          rawResponse: JSON.stringify({
            status: 'UNVERIFIABLE',
            reason: 'The evidence snippet about solar panels does not mention nuclear fusion or commercial airlines.',
            supportingEvidenceIds: [],
            contradictingEvidenceIds: [],
            matchedEvidence: [],
          }),
        };
      }
    },
  };

  const verificationResult = await ClaimVerificationService.verifyClaims(
    { evidenceBatch, claimBatch },
    { provider: mockProvider, domain: 'general' }
  );

  assert(verificationResult.totalClaims === 3, 'Batch contains 3 verified claims');
  assert(verificationResult.verifiedClaims[0].verificationStatus === 'SUPPORTED', 'Claim 1 verified as SUPPORTED');
  assert(verificationResult.verifiedClaims[1].verificationStatus === 'SUPPORTED', 'Claim 2 verified as SUPPORTED');
  assert(verificationResult.verifiedClaims[2].verificationStatus === 'UNVERIFIABLE', 'Claim 3 verified as UNVERIFIABLE');
  assert(verificationResult.executionSummary.supportedCount === 2, 'Execution summary counts 2 SUPPORTED claims');
  assert(verificationResult.executionSummary.unverifiableCount === 1, 'Execution summary counts 1 UNVERIFIABLE claim');

  console.log('\n====================================================');
  console.log('✅ ALL TEST SUITES PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST SUITE FAILED WITH ERROR:', err);
  process.exit(1);
});
