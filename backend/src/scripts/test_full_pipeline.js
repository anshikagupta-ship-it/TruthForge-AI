import { FullPipelineService } from '../modules/pipeline/services/fullPipeline.service.js';

async function testFullPipeline() {
  console.log('=== Testing Full End-to-End Pipeline Execution ===');
  const result = await FullPipelineService.executeFullVerification({
    query: 'Does quantum computing enhance cryptographic encryption resilience?',
    domain: 'Technology',
    depth: 'Detailed',
    max_sources: 10
  });

  console.log('✅ Pipeline Execution Completed!');
  console.log('Query ID:', result.queryId);
  console.log('Domain:', result.domain);
  console.log('Overall Confidence Score:', result.overallConfidence);
  console.log('Verified Claims Count:', result.verifiedClaims.length);
  console.log('Sources Checked Count:', result.sources.length);
  console.log('Report Markdown Length:', result.reportMarkdown.length);
  console.log('Render Link:', result.executionSummary.renderLink);

  if (result.overallConfidence > 0 && result.reportMarkdown.length > 100) {
    console.log('🎉 FULL PIPELINE TEST PASSED SUCCESSFULLY!');
  } else {
    console.error('❌ Pipeline output failed assertion');
    process.exit(1);
  }
}

testFullPipeline().catch(err => {
  console.error('Test Error:', err);
  process.exit(1);
});
