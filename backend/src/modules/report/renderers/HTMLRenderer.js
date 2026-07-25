import { escapeHtml } from '../utils/formattingHelpers.js';

export class HTMLRenderer {
  static render(reportData) {
    const { metadata, executiveSummary, sections = [] } = reportData;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TruthForge-AI Report - ${escapeHtml(metadata.reportId)}</title>
  <style>
    :root {
      --bg-primary: #0f172a;
      --bg-card: #1e293b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --success: #22c55e;
      --warning: #eab308;
      --danger: #ef4444;
      --border: #334155;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg-primary);
      color: var(--text-main);
      margin: 0;
      padding: 2rem;
      line-height: 1.6;
    }
    .container { max-width: 1000px; margin: 0 auto; }
    .header { border-bottom: 2px solid var(--border); padding-bottom: 1rem; margin-bottom: 2rem; }
    .card { background: var(--bg-card); border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid var(--border); }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; }
    .badge-success { background: rgba(34, 197, 94, 0.2); color: var(--success); }
    .badge-warning { background: rgba(234, 179, 8, 0.2); color: var(--warning); }
    .badge-danger { background: rgba(239, 68, 68, 0.2); color: var(--danger); }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
    th { background: rgba(255, 255, 255, 0.05); color: var(--accent); }
    pre { background: #090d16; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TruthForge-AI Research Report</h1>
      <p style="color: var(--text-muted);">
        Report ID: <code>${escapeHtml(metadata.reportId)}</code> | Generated: <code>${escapeHtml(metadata.generatedAt)}</code>
      </p>
    </div>

    <div class="card">
      <h2>1. Executive Summary</h2>
      <p>Overall Verdict: <span class="badge badge-success">${escapeHtml(executiveSummary.overallVerdict)}</span></p>
      <p>Overall Confidence Score: <strong>${executiveSummary.overallConfidence}/100</strong></p>
      <ul>
        <li>Verified Claims: ${executiveSummary.verifiedClaims} (Supported: ${executiveSummary.supportedClaims}, Contradicted: ${executiveSummary.contradictedClaims})</li>
        <li>Evidence Items Analyzed: ${executiveSummary.totalEvidenceItems}</li>
        <li>Unique Sources Used: ${executiveSummary.uniqueSourcesUsed}</li>
      </ul>
    </div>

    ${sections.filter(s => s.order > 1).map(sec => `
      <div class="card">
        <h2>${sec.order}. ${escapeHtml(sec.title)}</h2>
        <pre><code>${escapeHtml(JSON.stringify(sec.content, null, 2))}</code></pre>
      </div>
    `).join('')}
  </div>
</body>
</html>`;
  }
}
