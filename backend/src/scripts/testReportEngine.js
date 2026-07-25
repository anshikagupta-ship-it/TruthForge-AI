import { ReportGeneratorService } from '../modules/report/services/reportGenerator.service.js';
import { computeDeterministicHash } from '../modules/report/utils/deterministicHasher.js';

// Mock input batches from Phases 1-6
const mockInputBatches = {
  query: {
    queryId: 'qry-10029',
    queryString: 'Does artificial intelligence increase diagnostic accuracy in radiology?',
    domainContext: 'Healthcare AI',
    executionTimestamp: '2026-07-26T01:00:00.000Z'
  },
  verificationBatch: {
    verifiedClaims: [
      {
        claimId: 'clm-001',
        claim: 'AI algorithms demonstrate over 90% diagnostic accuracy in lung cancer CT scans.',
        verificationStatus: 'SUPPORTED',
        confidence: 94,
        citedEvidence: ['ev-01', 'ev-02'],
        sources: ['nih.gov', 'radiology.rsna.org']
      },
      {
        claimId: 'clm-002',
        claim: 'AI completely replaces human radiologists in clinical workflows.',
        verificationStatus: 'CONTRADICTED',
        confidence: 88,
        citedEvidence: ['ev-03'],
        sources: ['who.int']
      }
    ]
  },
  confidenceBatch: {
    claims: [
      {
        claimId: 'clm-001',
        score: 94,
        confidenceLevel: 'VERY_HIGH',
        explanations: [
          'Claim supported by 2 evidence items from 2 unique domains with average source authenticity of 98.5%.',
          'High source authority tier (.gov, academic radiology).'
        ],
        appliedPenalties: []
      },
      {
        claimId: 'clm-002',
        score: 88,
        confidenceLevel: 'HIGH',
        explanations: [
          'Claim contradicted by higher-authority evidence items (Average authenticity: 99.0%).',
          'Confidence reduced by 5 points due to single source domain reliance.'
        ],
        appliedPenalties: [{ points: 5, reason: 'Single source domain dependency' }]
      }
    ]
  },
  evidenceBatch: {
    items: [
      { id: 'ev-01', text: 'Diagnostic sensitivity reached 92.4% for AI-assisted CT analysis.', qualityScore: 95 },
      { id: 'ev-02', text: 'Multi-center validation confirmed high precision across radiologist panels.', qualityScore: 92 },
      { id: 'ev-03', text: 'WHO guidelines state AI is designed as a decision-support tool, not a full replacement.', qualityScore: 98 }
    ]
  },
  sourceAuthenticityBatch: {
    profiles: [
      { domain: 'nih.gov', trustLevel: 'GOVERNMENT', authenticityScore: 99, tld: 'gov' },
      { domain: 'radiology.rsna.org', trustLevel: 'ACADEMIC', authenticityScore: 95, tld: 'org' },
      { domain: 'who.int', trustLevel: 'GOVERNMENT', authenticityScore: 99, tld: 'int' }
    ]
  },
  evidenceLineageBatch: {
    completeChains: 2,
    partialChains: 0,
    brokenChains: 0,
    graphStatistics: { totalNodes: 8, totalEdges: 10, rootHash: '0x9918a2bc4e' },
    claims: [
      { claimId: 'clm-001', provenancePath: ['root', 'clm-001', 'ev-01', 'nih.gov'] },
      { claimId: 'clm-002', provenancePath: ['root', 'clm-002', 'ev-03', 'who.int'] }
    ]
  }
};

async function runTests() {
  console.log('====================================================');
  console.log('  TESTING PHASE 7: EXPLAINABLE REPORT GENERATOR ENGINE  ');
  console.log('====================================================\n');

  // Test 1: Single Run Multi-Format Generation
  console.log('[Test 1] Generating multi-format ReportPackage...');
  const reportPackage = ReportGeneratorService.generateReport(mockInputBatches, ['json', 'markdown', 'html', 'pdf', 'text']);
  
  console.log(`\n✓ Report generated successfully.`);
  console.log(`  Report ID:           ${reportPackage.report.metadata.reportId}`);
  console.log(`  Execution Time:      ${reportPackage.report.metadata.executionTimeMs} ms`);
  console.log(`  Overall Verdict:     ${reportPackage.report.executiveSummary.overallVerdict}`);
  console.log(`  Overall Confidence:  ${reportPackage.report.executiveSummary.overallConfidence}/100`);
  console.log(`  Sections Built:      ${reportPackage.report.sections.length}/10`);
  console.log(`  Rendered Formats:    ${reportPackage.renderedFiles.map(f => f.format).join(', ')}`);

  // Assert all 10 sections present
  if (reportPackage.report.sections.length === 10) {
    console.log('✓ Section Integrity: All 10 deterministic sections verified.');
  } else {
    console.error('✗ Section Integrity Failed!');
    process.exit(1);
  }

  // Test 2: Determinism & Byte-Identical Output Test (100 Iterations)
  console.log('\n[Test 2] Running 100-run Determinism Verification Test...');
  const initialMarkdown = reportPackage.renderedFiles.find(f => f.format === 'markdown').content;
  const initialHash = computeDeterministicHash(initialMarkdown);

  let determinismPassed = true;
  for (let i = 1; i <= 100; i++) {
    const pkg = ReportGeneratorService.generateReport(mockInputBatches, ['markdown']);
    const md = pkg.renderedFiles[0].content;
    const currentHash = computeDeterministicHash(md);
    if (currentHash !== initialHash) {
      console.error(`✗ Determinism mismatch at run ${i}!`);
      determinismPassed = false;
      break;
    }
  }

  if (determinismPassed) {
    console.log('✓ Determinism Verification: 100/100 runs generated 100% byte-identical reports (SHA-256 matched).');
  } else {
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('  ALL PHASE 7 TESTS PASSED SUCCESSFULLY!  ');
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
