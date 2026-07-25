export class TextRenderer {
  static render(reportData) {
    const { metadata, executiveSummary, sections = [] } = reportData;

    let txt = `========================================================================\n`;
    txt += `                    TRUTHFORGE-AI RESEARCH REPORT                       \n`;
    txt += `========================================================================\n\n`;
    txt += `Report ID:        ${metadata.reportId}\n`;
    txt += `Generated At:     ${metadata.generatedAt}\n`;
    txt += `Pipeline Version: ${metadata.pipelineVersion}\n\n`;

    txt += `------------------------------------------------------------------------\n`;
    txt += `1. EXECUTIVE SUMMARY\n`;
    txt += `------------------------------------------------------------------------\n`;
    txt += `Overall Verdict:          ${executiveSummary.overallVerdict}\n`;
    txt += `Overall Confidence Score: ${executiveSummary.overallConfidence}/100\n`;
    txt += `Verified Claims:          ${executiveSummary.verifiedClaims} (Supported: ${executiveSummary.supportedClaims}, Contradicted: ${executiveSummary.contradictedClaims})\n`;
    txt += `Total Evidence Items:     ${executiveSummary.totalEvidenceItems}\n`;
    txt += `Unique Sources Used:      ${executiveSummary.uniqueSourcesUsed}\n\n`;

    sections.forEach(sec => {
      if (sec.order === 1) return;
      txt += `------------------------------------------------------------------------\n`;
      txt += `${sec.order}. ${sec.title.toUpperCase()}\n`;
      txt += `------------------------------------------------------------------------\n`;
      txt += `${JSON.stringify(sec.content, null, 2)}\n\n`;
    });

    return txt;
  }
}
