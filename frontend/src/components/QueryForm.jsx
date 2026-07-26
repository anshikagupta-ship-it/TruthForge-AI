import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

export function QueryForm({ onSubmit, isLoading }) {
  const [query, setQuery] = useState('Does artificial intelligence increase diagnostic accuracy in radiology?');
  const [depth, setDepth] = useState('Detailed');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSubmit({ query: query.trim(), depth });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <Sparkles size={20} color="#a855f7" />
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
          Execute Fact-Checking Verification Query
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' }}>
            Research Query / Claim Statement
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="input-glass"
              placeholder="e.g. mRNA vaccines do not alter human host genomic DNA..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              style={{ paddingLeft: '44px' }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Verification Depth:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Basic', 'Detailed'].map(d => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDepth(d)}
                  disabled={isLoading}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: depth === d ? 'var(--primary-glow)' : 'var(--bg-glass)',
                    color: depth === d ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: '500' }}>
            🌐 Automated Multi-Domain Source Ingestion Enabled
          </span>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin-slow" style={{ width: '18px', height: '18px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
              <span>Orchestrating Multi-Domain Verification Pipeline...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Run TruthForge Verification Pipeline</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
