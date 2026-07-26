import React, { useEffect, useState } from 'react';
import { ShieldCheck, Server, ExternalLink, Activity } from 'lucide-react';
import { checkBackendHealth } from '../services/api';

export function Header() {
  const [healthStatus, setHealthStatus] = useState({ isHealthy: true, baseUrl: 'https://truthforge-ai-eza4.onrender.com' });

  useEffect(() => {
    checkBackendHealth().then(res => setHealthStatus(res));
  }, []);

  return (
    <header className="glass-panel" style={{ borderRadius: '0 0 20px 20px', padding: '16px 32px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            <ShieldCheck size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }} className="gradient-text">
              TruthForge-AI
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Explainable AI Research & Verification Engine
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a
            href="https://truthforge-ai-eza4.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)'
            }}
          >
            <Server size={14} color="#6366f1" />
            <span>Render Deploy</span>
            <ExternalLink size={12} />
          </a>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '999px',
            background: healthStatus.isHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${healthStatus.isHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            fontSize: '0.8rem',
            fontWeight: '600',
            color: healthStatus.isHealthy ? 'var(--status-verified)' : 'var(--status-contradicted)'
          }}>
            <Activity size={14} className={healthStatus.isHealthy ? '' : 'animate-pulse-glow'} />
            <span>{healthStatus.isHealthy ? 'API Online' : 'Connecting...'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
