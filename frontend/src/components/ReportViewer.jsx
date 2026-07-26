import React, { useState } from 'react';
import { FileText, Copy, Download, Check } from 'lucide-react';

export function ReportViewer({ markdown = '', query = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([markdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `TruthForge_Verification_Report.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

        <div style={{ display: 'flex', gap: '10px' }}>
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
            onClick={handleDownload}
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
              cursor: 'pointer'
            }}
          >
            <Download size={14} />
            <span>Export Report (.md)</span>
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
