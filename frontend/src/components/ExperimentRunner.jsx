import React from 'react';
import { useExperimentRunner } from '../hooks/useExperimentRunner';
import { LoadingState, ErrorState } from './SharedStates';
import './ExperimentRunner.css';

// ─── sub-renderers (keep JSX readable without extra files) ───────────────────

function ConditionsGrid({ conditions }) {
  const items = [
    { label: 'Temperature',    value: `${conditions?.temperature} °C` },
    { label: 'Concentration',  value: `${conditions?.concentration} M` },
    { label: 'Catalyst',       value: conditions?.catalyst },
    { label: 'Reaction Time',  value: `${conditions?.time} min` },
  ];
  return (
    <div className="conditions-grid">
      {items.map(({ label, value }) => (
        <div key={label} className="condition-item">
          <span className="condition-label">{label}</span>
          <span className="condition-value">{value}</span>
        </div>
      ))}
    </div>
  );
}

function YieldCompareArrow({ actual, predicted }) {
  if (actual > predicted) return <span style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 'bold' }}>↑</span>;
  if (actual < predicted) return <span style={{ color: 'var(--error)', fontSize: '1.2rem', fontWeight: 'bold' }}>↓</span>;
  return <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 'bold' }}>—</span>;
}

// ─── main component ──────────────────────────────────────────────────────────

export default function ExperimentRunner({ runId, suggestedConditions, iterationCount, onIterationComplete }) {
  const {
    phase,
    predictedYield,
    actualYield,
    setActualYield,
    iterationResult,
    error,
    isSubmitDisabled,
    handlePredict,
    handleSubmitResult,
  } = useExperimentRunner(runId, suggestedConditions, iterationCount);

  const handleNext = () => {
    if (iterationResult) {
      onIterationComplete(iterationResult.iteration, iterationResult.runStatus);
    }
  };

  const numActual = Number(actualYield);
  const showYieldError = actualYield !== '' && (isNaN(numActual) || numActual < 0 || numActual > 100);

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        Experiment #{iterationCount + 1} — Suggested Conditions
      </div>

      <ConditionsGrid conditions={suggestedConditions} />

      {error && <ErrorState title="Error" message={error} inline />}

      <div className="runner-actions" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {phase === 'awaitingPrediction' && (
          <button className="primary-action-btn run-btn" onClick={handlePredict}>
            GET PREDICTED CONDITIONS
          </button>
        )}

        {phase === 'predicting' && <LoadingState message="Calculating hypothesis..." inline />}

        {(phase === 'predictionShown' || phase === 'submitting' || phase === 'resultRegistered') && (
          <div className="prediction-block slide-up" style={{ padding: '1rem', background: 'var(--bg-muted)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: '500', color: 'var(--text-muted)' }}>Predicted result:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-dark)' }}>{predictedYield}%</span>
            </div>

            {phase !== 'resultRegistered' ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enter your actual result (%)</label>
                  <input
                    type="number" min="0" max="100"
                    value={actualYield}
                    onChange={e => setActualYield(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', width: '100%' }}
                    placeholder="e.g. 75"
                  />
                  {showYieldError && (
                    <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Value must be between 0 and 100</span>
                  )}
                </div>
                <button
                  className="primary-action-btn"
                  onClick={handleSubmitResult}
                  disabled={isSubmitDisabled}
                  style={{ width: '150px' }}
                >
                  {phase === 'submitting' ? 'Submitting...' : 'SUBMIT MY RESULT'}
                </button>
              </div>
            ) : (
              <div className="result-registered-block slide-up" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-muted)' }}>Your actual result:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-dark)' }}>{actualYield}%</span>
                    <YieldCompareArrow actual={numActual} predicted={predictedYield} />
                  </div>
                </div>
                <button className="primary-action-btn run-btn" onClick={handleNext}>
                  CONTINUE TO NEXT ITERATION →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
