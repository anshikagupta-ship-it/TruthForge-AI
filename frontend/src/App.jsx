import React, { useState } from 'react';
import { Header } from './components/Header';
import { QueryForm } from './components/QueryForm';
import { PipelineTracker } from './components/PipelineTracker';
import { ConfidenceGauge } from './components/ConfidenceGauge';
import { ClaimsTable } from './components/ClaimsTable';
import { SourceMatrix } from './components/SourceMatrix';
import { ReportViewer } from './components/ReportViewer';
import { executeFullVerification } from './services/api';

export function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(7);
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleQuerySubmit = async (formData) => {
    setIsLoading(true);
    setErrorMsg(null);
    setPipelineStage(1);

    // Simulate animated stage progress
    const stageTimer = setInterval(() => {
      setPipelineStage(prev => (prev < 6 ? prev + 1 : prev));
    }, 600);

    try {
      const data = await executeFullVerification(formData);
      clearInterval(stageTimer);
      setPipelineStage(7);
      setResultData(data);
    } catch (err) {
      clearInterval(stageTimer);
      setErrorMsg(err.message || 'Verification pipeline error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      <Header />

      <main className="container">
        <QueryForm onSubmit={handleQuerySubmit} isLoading={isLoading} />

        <PipelineTracker activeStage={pipelineStage} isRunning={isLoading} />

        {errorMsg && (
          <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.08)' }}>
            <p style={{ color: 'var(--status-contradicted)', margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>
              ⚠️ Execution Error: {errorMsg}
            </p>
          </div>
        )}

        {resultData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="grid-dashboard">
              <ConfidenceGauge
                score={resultData.overallConfidence}
                breakdown={resultData.confidenceBreakdown}
              />
              <ClaimsTable claims={resultData.verifiedClaims} />
            </div>

            <SourceMatrix sources={resultData.sources} />

            <ReportViewer markdown={resultData.reportMarkdown} query={resultData.query} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
