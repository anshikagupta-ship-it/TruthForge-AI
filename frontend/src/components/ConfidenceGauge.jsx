import React from 'react';
import { Award, Info, ShieldAlert } from 'lucide-react';

export function ConfidenceGauge({ score = 92.5, breakdown = {} }) {
  const roundedScore = Math.round(score * 10) / 10;
  const strokeDash = (roundedScore / 100) * 283; // 2 * PI * 45

  const factors = [
    { name: 'Source Authenticity', weight: '40%', score: breakdown.sourceAuthenticity || 94.0, color: '#6366f1' },
    { name: 'Evidence Agreement', weight: '30%', score: breakdown.evidenceAgreement || 90.0, color: '#a855f7' },
    { name: 'Source Coverage', weight: '20%', score: breakdown.sourceCoverage || 85.0, color: '#06b6d4' },
    { name: 'Publication Freshness', weight: '10%', score: breakdown.freshness || 95.0, color: '#10b981' }
  ];

  return (
    <div className="glass-panel glass-panel-glow" style={{ padding: '24px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} color="#a855f7" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
            Explainable Confidence Score
          </h3>
        </div>
        <span className="badge badge-verified">
          High Trust
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
          <svg width="160" height="160" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={283 - strokeDash}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '2.2rem', fontWeight: '800', fontFamily: 'var(--font-display)', margin: 0 }}>
              {roundedScore}%
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Confidence
            </span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '16px' }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '600' }}>
          Mathematical Factor Breakdown
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {factors.map(f => (
            <div key={f.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                  {f.name} <span style={{ color: 'var(--text-muted)' }}>({f.weight})</span>
                </span>
                <span style={{ fontWeight: '700', color: f.color }}>{f.score}%</span>
              </div>
              <div style={{ height: '6px', width: '100%', background: 'var(--bg-glass)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${f.score}%`, background: f.color, borderRadius: '3px', transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
