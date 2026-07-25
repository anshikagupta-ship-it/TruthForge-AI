/**
 * User Prompts for Claim Verification Engine
 */

/**
 * Builds the user prompt for verifying a single claim against evidence context
 * @param {Object} params
 * @param {string} params.query - Original user query statement
 * @param {Object} params.claim - Target claim object containing claimId and statement
 * @param {string} params.evidenceContextBlock - Formatted evidence context payload
 * @returns {string} Fully rendered user prompt
 */
export function buildUserPrompt({ query = '', claim = {}, evidenceContextBlock = '' }) {
  const claimId = claim.claimId || claim.id || 'claim-unknown';
  const statement = claim.statement || '';

  return `ORIGINAL USER QUERY:
"${query}"

TARGET CLAIM STATEMENT TO VERIFY:
Claim ID: ${claimId}
Statement: "${statement}"

SUPPLIED EVIDENCE CONTEXT:
${evidenceContextBlock}

TASK INSTRUCTIONS:
1. Evaluate if the supplied evidence context supports, contradicts, partially supports, or fails to verify the target claim statement.
2. Identify all supporting evidence IDs and contradicting evidence IDs from the context.
3. Provide a brief 1-3 sentence explanation grounded STRICTLY in the evidence snippets provided.

REQUIRED JSON RESPONSE SCHEMA:
{
  "status": "SUPPORTED" | "PARTIALLY_SUPPORTED" | "CONTRADICTED" | "INSUFFICIENT_EVIDENCE" | "UNVERIFIABLE",
  "reason": "Concise 1-3 sentence explanation grounded strictly in the provided evidence.",
  "supportingEvidenceIds": ["ev_1"],
  "contradictingEvidenceIds": ["ev_2"],
  "matchedEvidence": [
    {
      "evidenceId": "ev_1",
      "relevance": 0.95,
      "notes": "Brief note on how this snippet relates to the claim assertion."
    }
  ]
}`;
}
