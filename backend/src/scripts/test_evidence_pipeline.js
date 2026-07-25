import { CsvEvidenceProvider } from '../modules/evidence/providers/csvEvidenceProvider.js';
import { EvidenceProfilingEngine } from '../modules/evidence/services/evidenceProfilingEngine.service.js';
import { parseCsvLine } from '../modules/evidence/parser/csvParser.js';

let passed = 0;
let failed = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`\x1b[32m[PASS]\x1b[0m ${testName}`);
    passed++;
  } catch (err) {
    console.error(`\x1b[31m[FAIL]\x1b[0m ${testName}`);
    console.error(err);
    failed++;
  }
}

async function runAsyncTest(testName, fn) {
  try {
    await fn();
    console.log(`\x1b[32m[PASS]\x1b[0m ${testName}`);
    passed++;
  } catch (err) {
    console.error(`\x1b[31m[FAIL]\x1b[0m ${testName}`);
    console.error(err);
    failed++;
  }
}

console.log('====================================================');
console.log('   TruthForge-AI Evidence Pipeline Unit Test Suite  ');
console.log('====================================================\n');

// Test 1: CSV Line Parsing Utility
runTest('CSV Parser Utility: Quoted line handling', () => {
  const line = 'Water Born Diseases,"https://www.niehs.nih.gov?id=1,2",0.64,0.0,0.64,"Waterborne diseases, such as cholera."';
  const parsed = parseCsvLine(line);
  if (parsed.length !== 6) throw new Error(`Expected 6 elements, got ${parsed.length}`);
  if (parsed[1] !== 'https://www.niehs.nih.gov?id=1,2') throw new Error(`Quote splitting failed: ${parsed[1]}`);
  if (parsed[5] !== 'Waterborne diseases, such as cholera.') throw new Error(`Quote splitting text failed: ${parsed[5]}`);
});

// Test 2: Valid CSV Ingestion, Normalization, Metadata & PipelineContext
await runAsyncTest('Evidence Ingestion: Valid CSV parsing, PipelineContext & Metadata', async () => {
  const csvContent = `query,source_url,semantic_score,bonus,score,text
Water Born Diseases,https://www.niehs.nih.gov,0.64,0.0,0.85,Waterborne diseases are conditions caused by pathogenic micro-organisms.
Water Born Diseases,https://www.cdc.gov/water,0.78,0.1,0.92,Clean water prevents waterborne illnesses worldwide.`;

  const provider = new CsvEvidenceProvider();
  const { evidenceBatch } = await provider.ingest(csvContent, {
    filename: 'test_valid.csv',
    pipelineRunId: 'run_test_123',
    retrievalModel: 'RetrievalModel-v2',
  });

  if (!evidenceBatch.pipelineContext) throw new Error('Missing pipelineContext in evidenceBatch');
  if (evidenceBatch.pipelineContext.pipelineRunId !== 'run_test_123') {
    throw new Error(`pipelineRunId mismatch: ${evidenceBatch.pipelineContext.pipelineRunId}`);
  }
  if (evidenceBatch.pipelineContext.retrievalModel !== 'RetrievalModel-v2') {
    throw new Error(`retrievalModel mismatch: ${evidenceBatch.pipelineContext.retrievalModel}`);
  }

  if (evidenceBatch.totalRows !== 2) throw new Error(`Expected totalRows 2, got ${evidenceBatch.totalRows}`);
  if (evidenceBatch.validRows !== 2) throw new Error(`Expected validRows 2, got ${evidenceBatch.validRows}`);
  if (evidenceBatch.skippedRows !== 0) throw new Error(`Expected skippedRows 0, got ${evidenceBatch.skippedRows}`);

  const item1 = evidenceBatch.evidences[0];
  if (!item1.id || typeof item1.id !== 'string') throw new Error('UUID missing or invalid');
  if (item1.sourceDomain !== 'niehs.nih.gov') throw new Error(`Expected domain niehs.nih.gov, got ${item1.sourceDomain}`);
  if (item1.semanticScore !== 0.64) throw new Error(`Expected semanticScore 0.64, got ${item1.semanticScore}`);
  if (item1.retrievalScore !== 0.85) throw new Error(`Expected retrievalScore 0.85, got ${item1.retrievalScore}`);

  if (!item1.metadata || item1.metadata.provider !== 'CSV') {
    throw new Error('Metadata provider field missing or incorrect');
  }
});

// Test 3: Missing Required Headers Failure
await runAsyncTest('Evidence Ingestion: Rejects missing required headers', async () => {
  const badCsv = `query,source_url,bonus,score
Water Born Diseases,https://www.niehs.nih.gov,0.0,0.64`;

  const provider = new CsvEvidenceProvider();
  try {
    await provider.ingest(badCsv);
    throw new Error('Should have thrown error for missing headers');
  } catch (err) {
    if (!err.message.includes('missing required column')) {
      throw new Error(`Unexpected error message: ${err.message}`);
    }
  }
});

// Test 4: Empty CSV File Failure
await runAsyncTest('Evidence Ingestion: Rejects empty CSV', async () => {
  const emptyCsv = `   \n  \n`;
  const provider = new CsvEvidenceProvider();
  try {
    await provider.ingest(emptyCsv);
    throw new Error('Should have thrown error for empty CSV');
  } catch (err) {
    if (!err.message.includes('Empty CSV')) {
      throw new Error(`Unexpected error message: ${err.message}`);
    }
  }
});

// Test 5: Row Skipping & Diagnostic SkippedRows Preservation
await runAsyncTest('Evidence Ingestion: Preserves skipped rows details for diagnostics', async () => {
  const mixedCsv = `query,source_url,semantic_score,bonus,score,text
Water Born Diseases,https://www.niehs.nih.gov,0.64,0.0,0.64,Valid record 1
Water Born Diseases,invalid-url-here,0.64,0.0,0.64,Invalid URL row
Water Born Diseases,https://www.niehs.nih.gov,1.5,0.0,0.64,Semantic score > 1
Water Born Diseases,https://www.niehs.nih.gov,0.64,0.0,-0.1,Retrieval score < 0
Water Born Diseases,https://www.niehs.nih.gov,0.64,0.0,0.64,
Water Born Diseases,https://www.who.int,0.91,0.05,0.88,Valid record 2`;

  const provider = new CsvEvidenceProvider();
  const { evidenceBatch } = await provider.ingest(mixedCsv);

  if (evidenceBatch.totalRows !== 6) throw new Error(`Expected totalRows 6, got ${evidenceBatch.totalRows}`);
  if (evidenceBatch.validRows !== 2) throw new Error(`Expected validRows 2, got ${evidenceBatch.validRows}`);
  if (evidenceBatch.skippedRows !== 4) throw new Error(`Expected skippedRows 4, got ${evidenceBatch.skippedRows}`);

  if (!Array.isArray(evidenceBatch.skippedRowsDetails) || evidenceBatch.skippedRowsDetails.length !== 4) {
    throw new Error(`Expected 4 skippedRowsDetails items, got ${evidenceBatch.skippedRowsDetails?.length}`);
  }

  const firstSkip = evidenceBatch.skippedRowsDetails[0];
  if (firstSkip.rowNumber !== 3) throw new Error(`Expected skip rowNumber 3, got ${firstSkip.rowNumber}`);
  if (!firstSkip.reason.includes('Invalid URL')) throw new Error(`Unexpected reason: ${firstSkip.reason}`);
  if (!firstSkip.rawRow) throw new Error('Missing rawRow object in skippedRowsDetails item');
});

// Test 6: Duplicate Row Detection & Skipping
await runAsyncTest('Evidence Ingestion: Deduplication handling', async () => {
  const dupCsv = `query,source_url,semantic_score,bonus,score,text
Water Born Diseases,https://www.niehs.nih.gov,0.64,0.0,0.64,Waterborne diseases are conditions.
Water Born Diseases,https://www.niehs.nih.gov,0.64,0.0,0.64,Waterborne diseases are conditions.
Water Born Diseases,https://www.niehs.nih.gov,0.80,0.0,0.90,Different text snippet here.`;

  const provider = new CsvEvidenceProvider();
  const { evidenceBatch } = await provider.ingest(dupCsv);

  if (evidenceBatch.totalRows !== 3) throw new Error(`Expected totalRows 3, got ${evidenceBatch.totalRows}`);
  if (evidenceBatch.validRows !== 2) throw new Error(`Expected validRows 2, got ${evidenceBatch.validRows}`);
  if (evidenceBatch.duplicateRows !== 1) throw new Error(`Expected duplicateRows 1, got ${evidenceBatch.duplicateRows}`);
});

// Test 7: Large CSV Streaming Performance (2,000 Rows)
await runAsyncTest('Evidence Ingestion: Multi-thousand row streaming performance', async () => {
  const rows = ['query,source_url,semantic_score,bonus,score,text'];
  for (let i = 1; i <= 2000; i++) {
    const domain = i % 2 === 0 ? 'cdc.gov' : 'nih.gov';
    rows.push(`Query test,https://www.${domain}/page${i},0.75,0.0,0.80,Evidence text content for row ${i}`);
  }
  const largeCsv = rows.join('\n');

  const provider = new CsvEvidenceProvider();
  const startTime = Date.now();
  const { evidenceBatch } = await provider.ingest(largeCsv, { filename: 'large_benchmark.csv' });
  const duration = Date.now() - startTime;

  if (evidenceBatch.totalRows !== 2000) throw new Error(`Expected 2000 totalRows, got ${evidenceBatch.totalRows}`);
  if (evidenceBatch.validRows !== 2000) throw new Error(`Expected 2000 validRows, got ${evidenceBatch.validRows}`);
  if (duration > 3000) throw new Error(`Ingestion took too long: ${duration}ms (target <3000ms)`);
});

// Test 8: Evidence Profiling Engine Verification
await runAsyncTest('Evidence Profiling Engine: Independent healthMetrics & Retrieval Statistics', async () => {
  const csvData = `query,source_url,semantic_score,bonus,score,text
Waterborne Diseases,https://www.niehs.nih.gov/water,0.85,0.1,0.90,Text 1
Waterborne Diseases,https://www.cdc.gov/water,0.70,0.0,0.75,Text 2
Waterborne Diseases,https://www.who.int/water,0.40,0.0,0.50,Text 3
Waterborne Diseases,invalid-url,0.10,0.0,0.10,Text 4`;

  const provider = new CsvEvidenceProvider();
  const { evidenceBatch } = await provider.ingest(csvData);

  const engine = new EvidenceProfilingEngine();
  const profile = engine.profile(evidenceBatch);

  // Check absence of composite qualityScore
  if ('qualityScore' in profile) {
    throw new Error('EvidenceProfile must NOT contain qualityScore property!');
  }

  // Check healthMetrics
  const { healthMetrics, distributions, topDomains, warnings } = profile;
  if (!healthMetrics) throw new Error('Missing healthMetrics in EvidenceProfile');

  if (healthMetrics.validityRatio !== 0.75) {
    throw new Error(`Expected validityRatio 0.75, got ${healthMetrics.validityRatio}`);
  }
  if (healthMetrics.duplicateRatio !== 0) {
    throw new Error(`Expected duplicateRatio 0, got ${healthMetrics.duplicateRatio}`);
  }
  if (typeof healthMetrics.semanticStrength !== 'number' || healthMetrics.semanticStrength <= 0) {
    throw new Error(`Invalid semanticStrength: ${healthMetrics.semanticStrength}`);
  }
  if (typeof healthMetrics.retrievalStrength !== 'number' || healthMetrics.retrievalStrength <= 0) {
    throw new Error(`Invalid retrievalStrength: ${healthMetrics.retrievalStrength}`);
  }

  // Check statistical distributions
  const { semanticStats, retrievalStats } = distributions;
  if (!semanticStats || !retrievalStats) throw new Error('Missing score statistics');

  if (semanticStats.minimumSemanticScore !== 0.4) {
    throw new Error(`Expected min semantic score 0.4, got ${semanticStats.minimumSemanticScore}`);
  }
  if (semanticStats.maximumSemanticScore !== 0.85) {
    throw new Error(`Expected max semantic score 0.85, got ${semanticStats.maximumSemanticScore}`);
  }
  if (semanticStats.medianSemanticScore !== 0.7) {
    throw new Error(`Expected median semantic score 0.7, got ${semanticStats.medianSemanticScore}`);
  }
  if (typeof semanticStats.semanticScoreStandardDeviation !== 'number') {
    throw new Error('Missing semanticScoreStandardDeviation');
  }

  if (topDomains.length !== 3) throw new Error(`Expected 3 topDomains, got ${topDomains.length}`);
  if (!Array.isArray(warnings)) throw new Error('Missing warnings array');
});

console.log('\n====================================================');
console.log(`  RESULTS: ${passed} Passed, ${failed} Failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
