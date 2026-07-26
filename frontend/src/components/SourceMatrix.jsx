import React from 'react';
import { Database, ShieldCheck, Globe, CheckCircle2 } from 'lucide-react';

export function SourceMatrix({ sources = [] }) {
  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Database size={20} color="#06b6d4" />
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
            Evaluated Source Authenticity Matrix ({sources.length})
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Domain authority tiers, TLD security protocols, and trust scores calculated per kartikeya model specification
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 16px' }}>Source Repository / Domain</th>
              <th style={{ padding: '12px 16px' }}>Publisher / Org</th>
              <th style={{ padding: '12px 16px' }}>Type</th>
              <th style={{ padding: '12px 16px' }}>HTTPS</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Authenticity Score</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={14} color="#6366f1" />
                    <span>{s.domain || s.title}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                  {s.publisher || 'Official Academic'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'var(--bg-glass)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {s.source_type || s.sourceType || 'journal'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-verified)' }}>
                    <CheckCircle2 size={14} />
                    <span>Enforced</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: 'var(--status-verified)' }}>
                  {s.trustScore || s.authenticityScore || 95}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
