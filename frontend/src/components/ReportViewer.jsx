import React, { useState } from 'react';
import { FileText, Copy, Download, Check, Printer, Eye, Code } from 'lucide-react';

/**
 * Lightweight Markdown-to-HTML parser utility to eliminate raw markdown markup (**, #, -, |)
 * and display rich, beautifully formatted HTML typography cards.
 */
function renderFormattedReport(markdownText) {
  if (!markdownText) return null;

  const lines = markdownText.split('\n');
  const elements = [];
  let inTable = false;
  let tableHeader = [];
  let tableRows = [];

  const parseInline = (text) => {
    if (!text) return '';
    // Replace **bold** with <strong>
    let cleaned = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace *italic* or _italic_
    cleaned = cleaned.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Replace `code`
    cleaned = cleaned.replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;font-family:monospace;color:#a5b4fc">$1</code>');
    return cleaned;
  };

  const flushTable = (key) => {
    if (tableHeader.length > 0) {
      elements.push(
        <div key={`table-${key}`} style={{ overflowX: 'auto', margin: '16px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--accent-cyan)' }}>
                {tableHeader.map((h, i) => (
                  <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700' }} dangerouslySetInnerHTML={{ __html: parseInline(h) }} />
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: '8px 12px', color: 'var(--text-primary)' }} dangerouslySetInnerHTML={{ __html: parseInline(cell) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableHeader = [];
    tableRows = [];
    inTable = false;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Handle Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
      if (cells.every(c => c.replace(/[-:\s]/g, '').length === 0)) {
        // Alignment separator line, skip
        return;
      }
      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      return;
    } else if (inTable) {
      flushTable(idx);
    }

    if (!trimmed) {
      return;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={idx} style={{ fontSize: '1.5rem', fontWeight: '800', margin: '24px 0 12px 0', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }} className="gradient-text">
          {trimmed.replace(/^#\s+/, '')}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={idx} style={{ fontSize: '1.2rem', fontWeight: '700', margin: '20px 0 10px 0', color: '#f3f4f6', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
          {trimmed.replace(/^##\s+/, '')}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={idx} style={{ fontSize: '1.05rem', fontWeight: '600', margin: '16px 0 8px 0', color: 'var(--accent-purple)' }}>
          {trimmed.replace(/^###\s+/, '')}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletContent = trimmed.replace(/^[-*]\s+/, '');
      elements.push(
        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '6px 0', paddingLeft: '8px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }} dangerouslySetInnerHTML={{ __html: parseInline(bulletContent) }} />
        </div>
      );
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <div key={idx} style={{ background: 'var(--primary-glow)', borderLeft: '4px solid var(--primary)', padding: '12px 16px', borderRadius: '0 8px 8px 0', margin: '12px 0', fontSize: '0.88rem', color: '#e0e7ff' }} dangerouslySetInnerHTML={{ __html: parseInline(trimmed.replace(/^>\s+/, '')) }} />
      );
    } else {
      elements.push(
        <p key={idx} style={{ margin: '8px 0', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: parseInline(trimmed) }} />
      );
    }
  });

  if (inTable) {
    flushTable('final');
  }

  return elements;
}

export function ReportViewer({ markdown = '', query = '' }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('formatted'); // 'formatted' or 'raw'

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

    // Convert markdown into clean HTML for print document
    let cleanHtml = markdown
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^# (.*$)/gim, '<h1 style="color:#4f46e5;border-bottom:2px solid #e5e7eb;padding-bottom:6px">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 style="color:#1f2937;margin-top:20px;border-bottom:1px solid #f3f4f6">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 style="color:#6b21a8;margin-top:16px">$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/^\- (.*$)/gim, '<ul><li style="margin:4px 0">$1</li></ul>')
      .replace(/\n\n/gim, '<br/>');

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
              max-width: 900px;
              margin: 0 auto;
            }
            .header-banner {
              background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
              color: white;
              padding: 20px 28px;
              border-radius: 10px;
              margin-bottom: 28px;
            }
            .header-banner h2 { color: white; border: none; margin: 0; font-size: 22px; }
            .report-body { font-size: 14px; color: #374151; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
            th { background: #f9fafb; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <h2>TruthForge-AI Executive Verification Report</h2>
            <p style="margin:6px 0 0 0; font-size: 14px; opacity: 0.95;">Query: "${query || 'Research Verification'}"</p>
          </div>
          <div class="report-body">
            ${cleanHtml}
          </div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#a855f7" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
              Generated Verification Report
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-glass)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <button
              onClick={() => setViewMode('formatted')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'formatted' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'formatted' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Eye size={12} />
              <span>Formatted</span>
            </button>

            <button
              onClick={() => setViewMode('raw')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'raw' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'raw' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Code size={12} />
              <span>Raw MD</span>
            </button>
          </div>
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
        background: '#0a0f1d',
        border: '1px solid var(--border-glass)',
        borderRadius: '10px',
        padding: '24px',
        maxHeight: '550px',
        overflowY: 'auto'
      }}>
        {viewMode === 'formatted' ? (
          <div>{renderFormattedReport(markdown)}</div>
        ) : (
          <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#d1d5db', whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>
            {markdown || 'No report generated yet.'}
          </pre>
        )}
      </div>
    </div>
  );
}
