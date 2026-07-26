import React, { useState } from 'react';
import { FileText, Copy, Download, Check, Printer } from 'lucide-react';

export function ReportViewer({ markdown = '', query = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const element = document.createElement('a');
    const file = new Blob([markdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `TruthForge_Verification_Report.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>TruthForge-AI Verification Report</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              padding: 40px;
              color: #111827;
              line-height: 1.6;
            }
            h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; font-size: 24px; }
            h2 { color: #1f2937; margin-top: 24px; font-size: 18px; border-bottom: 1px solid #f3f4f6; }
            pre { background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; font-family: monospace; white-space: pre-wrap; }
            .header-banner { background: #4f46e5; color: white; padding: 16px 24px; border-radius: 8px; margin-bottom: 24px; }
            .header-banner h2 { color: white; border: none; margin: 0; }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <h2>TruthForge-AI Research Verification Report</h2>
            <p style="margin:4px 0 0 0; font-size: 14px; opacity: 0.9;">Query: "${query || 'Research Verification'}"</p>
          </div>
          <pre>${markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} color="#a855f7" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
            Generated Verification Report
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-glass)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={14} color="var(--status-verified)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownloadMd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-glass)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Download size={14} />
            <span>Markdown (.md)</span>
          </button>

          <button
            onClick={handlePrintPdf}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Printer size={14} />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      <div style={{
        background: '#070a12',
        border: '1px solid var(--border-glass)',
        borderRadius: '10px',
        padding: '20px',
        maxHeight: '500px',
        overflowY: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem',
        color: '#d1d5db',
        whiteSpace: 'pre-wrap',
        lineHeight: 1.6
      }}>
        {markdown || 'No report generated yet.'}
      </div>
    </div>
  );
}
