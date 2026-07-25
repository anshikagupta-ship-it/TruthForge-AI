export class MarkdownRenderer {
  static render(reportData) {
    const { metadata, executiveSummary, sections = [] } = reportData;

    let md = `# TruthForge-AI Research Report\n\n`;
    md += `**Report ID:** \`${metadata.reportId}\`  \n`;
    md += `**Generated At:** \`${metadata.generatedAt}\`  \n`;
    md += `**Pipeline Version:** \`${metadata.pipelineVersion}\`  \n\n`;

    md += `---\n\n`;
    md += `## 1. Executive Summary\n\n`;
    md += `- **Overall Verdict:** **${executiveSummary.overallVerdict}**\n`;
    md += `- **Overall Confidence Score:** **${executiveSummary.overallConfidence}/100**\n`;
    md += `- **Verified Claims:** ${executiveSummary.verifiedClaims} (Supported: ${executiveSummary.supportedClaims}, Contradicted: ${executiveSummary.contradictedClaims}, Insufficient: ${executiveSummary.insufficientClaims})\n`;
    md += `- **Evidence Items Analyzed:** ${executiveSummary.totalEvidenceItems}\n`;
    md += `- **Unique Sources Used:** ${executiveSummary.uniqueSourcesUsed}\n\n`;

    sections.forEach(sec => {
      if (sec.order === 1) return; // Already rendered in header
      md += `---\n\n`;
      md += `## ${sec.order}. ${sec.title}\n\n`;

      if (sec.order === 2 && sec.content) {
        md += `- **Query ID:** \`${sec.content.queryId}\`  \n`;
        md += `- **Query Text:** *"${sec.content.queryString}"*  \n`;
        md += `- **Domain Context:** ${sec.content.domainContext}  \n\n`;
      } else if (sec.order === 4 && sec.content && sec.content.claims) {
        md += `| Claim ID | Verdict | Confidence | Supporting Ev. | Contradicting Ev. |\n`;
        md += `| :--- | :--- | :--- | :--- | :--- |\n`;
        sec.content.claims.forEach(c => {
          md += `| \`${c.claimId}\` | **${c.verificationStatus}** | ${c.confidence}% (${c.confidenceLevel}) | ${c.supportingEvidence ? c.supportingEvidence.length : 0} | ${c.contradictingEvidence ? c.contradictingEvidence.length : 0} |\n`;
        });
        md += `\n### Itemized Claim Explanations\n\n`;
        sec.content.claims.forEach(c => {
          md += `#### Claim \`${c.claimId}\`: "${c.claim}"\n`;
          md += `- **Status:** ${c.verificationStatus}  \n`;
          md += `- **Confidence:** ${c.confidence}% (${c.confidenceLevel})  \n`;
          md += `- **Explanations:**  \n`;
          (c.explanation || []).forEach(exp => {
            md += `  - ${exp}\n`;
          });
          md += `\n`;
        });
      } else {
        md += `\`\`\`json\n${JSON.stringify(sec.content, null, 2)}\n\`\`\`\n\n`;
      }
    });

    return md;
  }
}
