/**
 * Verification Context Builder
 * Constructs compact, structured context payloads for LLM evaluation.
 */

export class VerificationContextBuilder {
  /**
   * Formats resolved evidence snippets into a structured context string for prompt injection
   * @param {Object} claim - Claim object containing statement and claimId
   * @param {Array<Object>} resolvedEvidence - List of resolved evidence objects from EvidenceResolver
   * @returns {string} Formatted context payload
   */
  static buildContext(claim, resolvedEvidence = []) {
    if (!resolvedEvidence || resolvedEvidence.length === 0) {
      return `[NO EVIDENCE AVAILABLE FOR THIS CLAIM]`;
    }

    const contextBlocks = resolvedEvidence.map((ev, idx) => {
      return `EVIDENCE ITEM #${idx + 1} [ID: ${ev.evidenceId}]
Source Domain: ${ev.domain}
Source URL: ${ev.sourceUrl}
Retrieval Relevance Score: ${ev.retrievalScore}
Snippet:
"${ev.contentSnippet}"`;
    });

    return contextBlocks.join('\n\n----------------------------------------\n\n');
  }
}
