import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, ChevronDown, ChevronUp, Link2 } from 'lucide-react';

export function ClaimsTable({ claims = [] }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const filteredClaims = filter === 'ALL'
    ? claims
    : claims.filter(c => (c.verificationStatus || 'SUPPORTED').toUpperCase() === filter);

  const getStatusBadge = (status) => {
    const s = (status || 'SUPPORTED').toUpperCase();
    switch (s) {
      case 'SUPPORTED':
      case 'VERIFIED':
        return <span className="badge badge-SUPPORTED"><CheckCircle size={12} /> Verified</span>;
      case 'CONTRADICTED':
        return <span className="badge badge-CONTRADICTED"><XCircle size={12} /> Contradicted</span>;
      case 'PARTIALLY_SUPPORTED':
        return <span className="badge badge-PARTIALLY_SUPPORTED"><AlertTriangle size={12} /> Partial</span>;
      default:
        return <span className="badge badge-UNVERIFIABLE"><HelpCircle size={12} /> Unverifiable</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
            Extracted & Verified Claims ({claims.length})
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Atomic statements extracted from evidence and cross-verified via multi-source LLM reasoning
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'SUPPORTED', 'CONTRADICTED', 'PARTIALLY_SUPPORTED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-glass)',
                background: filter === f ? 'var(--primary-glow)' : 'var(--bg-glass)',
                color: filter === f ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {f === 'ALL' ? 'All Claims' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredClaims.map((c, idx) => {
          const claimId = c.claimId || `clm-${idx}`;
          const isExpanded = expandedId === claimId;

          return (
            <div
              key={claimId}
              style={{
                background: 'rgba(10, 15, 26, 0.4)',
                border: '1px solid var(--border-glass)',
                borderRadius: '10px',
                padding: '16px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    {getStatusBadge(c.verificationStatus)}
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      ID: {claimId}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-primary)', margin: 0 }}>
                    "{c.statement || c.claim}"
                  </p>
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : claimId)}
                  style={{
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem'
                  }}
                >
                  <span>{isExpanded ? 'Hide Evidence' : 'Show Evidence'}</span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border-glass)', marginTop: '14px', paddingTop: '14px' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <strong>Verification Reasoning:</strong> {c.explanation || 'Verified against cited evidence snippets.'}
                  </p>
                  {c.supportingEvidenceIds && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                      <Link2 size={14} />
                      <span>Supporting Evidence IDs: {c.supportingEvidenceIds.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
