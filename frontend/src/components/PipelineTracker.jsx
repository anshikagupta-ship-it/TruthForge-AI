import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

const STAGES = [
  { id: 1, name: 'Query Processing', desc: 'Validating JSON & Domain Selection' },
  { id: 2, name: 'Trusted Sources', desc: 'Querying Domain Repositories' },
  { id: 3, name: 'Evidence Ingestion', desc: 'Cleaning & Normalizing Texts' },
  { id: 4, name: 'Claim Extraction', desc: 'Generating Atomic Fact Statements' },
  { id: 5, name: 'Claim Verification', desc: 'LLM Multi-Source Cross Matching' },
  { id: 6, name: 'Source Authenticity', desc: 'Evaluating Trust & TLD Factors' },
  { id: 7, name: 'Explainable Report', desc: 'Computing Confidence & Lineage' },
];

export function PipelineTracker({ activeStage = 7, isRunning = false }) {
  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Pipeline Execution Workflow Tracker
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {STAGES.map((s) => {
          const isDone = activeStage > s.id || (!isRunning && activeStage === 7);
          const isCurrent = isRunning && activeStage === s.id;

          return (
            <div
              key={s.id}
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: isCurrent
                  ? 'var(--primary-glow)'
                  : isDone
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'var(--bg-glass)',
                border: `1px solid ${
                  isCurrent
                    ? 'var(--primary)'
                    : isDone
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'var(--border-glass)'
                }`,
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                {isDone ? (
                  <CheckCircle2 size={16} color="var(--status-verified)" />
                ) : isCurrent ? (
                  <Loader2 size={16} color="var(--primary)" className="animate-spin-slow" />
                ) : (
                  <Circle size={16} color="var(--text-muted)" />
                )}
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isDone ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  Stage {s.id}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: '600', margin: '0 0 2px 0', color: 'var(--text-primary)' }}>
                {s.name}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
