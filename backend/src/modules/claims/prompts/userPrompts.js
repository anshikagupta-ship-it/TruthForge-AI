/**
 * User Prompt Generator for Claim Extraction
 */

/**
 * Generates structured user prompt with injected evidence context
 * @param {Object} params
 * @param {string} params.query - Target user search query
 * @param {Array<{evidenceId: string, text: string, sourceDomain: string}>} params.evidences - Evidence array
 * @param {Array<{code: string, message: string}>} [params.qualityWarnings] - Optional profiling warnings
 * @returns {string} Renders user prompt text
 */
export function buildUserPrompt({ query, evidences, qualityWarnings = [] }) {
  const formattedWarnings = qualityWarnings.length
    ? qualityWarnings.map(w => `- ${w.code}: ${w.message}`).join('\n')
    : 'NONE';

  const formattedEvidences = evidences
    .map(e => `[ID: ${e.evidenceId}] [Domain: ${e.sourceDomain}]\nText: "${e.text}"`)
    .join('\n\n');

  return `USER QUERY:
"${query}"

EVIDENCE PROFILING CONTEXT:
- Total Snippets Provided: ${evidences.length}
- Profile Quality Warnings:
${formattedWarnings}

INPUT EVIDENCE LIST:
${formattedEvidences}

TASK:
Extract all atomic factual claims supported by the evidence above.

Return a JSON object structured exactly as follows:
{
  "extractedClaims": [
    {
      "statement": "<Single atomic factual statement>",
      "supportingEvidenceIds": ["<evidenceId_1>", "<evidenceId_2>"]
    }
  ]
}`;
}
