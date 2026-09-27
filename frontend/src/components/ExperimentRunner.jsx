import React, { useState, useEffect } from 'react';
import { predictYield, registerResult } from '../api/runsApi';
import { LoadingState, ErrorState } from './SharedStates';
import './ExperimentRunner.css';

export default function ExperimentRunner({ runId, suggestedConditions, iterationCount, onIterationComplete }) {
  // awaitingPrediction -> predicting -> predictionShown -> submitting -> resultRegistered
  const [runnerState, setRunnerState] = useState('awaitingPrediction');
  const [predictedYield, setPredictedYield] = useState(null);
  const [actualYield, setActualYield] = useState('');
  const [iterationResult, setIterationResult] = useState(null);
  const [error, setError] = useState(null);

  // Reset state when new iteration starts
  useEffect(() => {
    setRunnerState('awaitingPrediction');
    setPredictedYield(null);
    setActualYield('');
    setIterationResult(null);
    setError(null);
  }, [iterationCount, suggestedConditions]);

  const handlePredict = async () => {
    if (!runId || !suggestedConditions) return;
    setRunnerState('predicting');
    setError(null);
    try {
      const data = await predictYield(runId, suggestedConditions);
      setPredictedYield(data.predictedYield);
      setRunnerState('predictionShown');
    } catch (err) {
      setError(err.message);
      setRunnerState('awaitingPrediction');
    }
  };

  const handleSubmitResult = async () => {
    const num = Number(actualYield);
    if (isNaN(num) || num < 0 || num > 100) return;
    setRunnerState('submitting');
    setError(null);
    try {
      const result = await registerResult(runId, num);
      setIterationResult(result);
      setRunnerState('resultRegistered');
    } catch (err) {
      setError(err.message);
      setRunnerState('predictionShown');
    }
  };

  const handleNext = () => {
    if (iterationResult) {
      onIterationComplete(iterationResult.iteration, iterationResult.runStatus);
    }
  };

  const numActual = Number(actualYield);
  const isSubmitDisabled = actualYield === '' || isNaN(numActual) || numActual < 0 || numActual > 100 || runnerState === 'submitting';

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        Experiment #{iterationCount + 1} — Suggested Conditions
      </div>

      <div className="conditions-grid">
        {[
          { label: 'Temperature', value: `${suggestedConditions?.temperature} °C` },
          { label: 'Concentration', value: `${suggestedConditions?.concentration} M` },
          { label: 'Catalyst', value: suggestedConditions?.catalyst },
          { label: 'Reaction Time', value: `${suggestedConditions?.time} min` },
        ].map(({ label, value }) => (
          <div key={label} className="condition-item">
            <span className="condition-label">{label}</span>
            <span className="condition-value">{value}</span>
          </div>
        ))}
      </div>

      {error && <ErrorState title="Error" message={error} inline />}

      <div className="runner-actions" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {runnerState === 'awaitingPrediction' && (
          <button className="primary-action-btn run-btn" onClick={handlePredict}>
            GET PREDICTED CONDITIONS
          </button>
        )}

        {runnerState === 'predicting' && (
          <LoadingState message="Calculating hypothesis..." inline />
        )}

        {(runnerState === 'predictionShown' || runnerState === 'submitting' || runnerState === 'resultRegistered') && (
          <div className="prediction-block slide-up" style={{ padding: '1rem', background: 'var(--bg-muted)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: '500', color: 'var(--text-muted)' }}>Predicted result:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-dark)' }}>{predictedYield}%</span>
            </div>

            {runnerState !== 'resultRegistered' ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enter your actual result (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={actualYield}
                    onChange={e => setActualYield(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', width: '100%' }}
                    placeholder="e.g. 75"
                  />
                  {actualYield !== '' && (isNaN(Number(actualYield)) || Number(actualYield) < 0 || Number(actualYield) > 100) && (
                    <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Value must be between 0 and 100</span>
                  )}
                </div>
                {runnerState === 'submitting' ? (
                  <button className="primary-action-btn" disabled style={{ width: '150px' }}>
                    Submitting...
                  </button>
                ) : (
                  <button className="primary-action-btn" onClick={handleSubmitResult} disabled={isSubmitDisabled} style={{ width: '150px' }}>
                    SUBMIT MY RESULT
                  </button>
                )}
              </div>
            ) : (
              <div className="result-registered-block slide-up" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-muted)' }}>Your actual result:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-dark)' }}>{actualYield}%</span>
                    {Number(actualYield) > predictedYield && <span style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 'bold' }}>↑</span>}
                    {Number(actualYield) < predictedYield && <span style={{ color: 'var(--error)', fontSize: '1.2rem', fontWeight: 'bold' }}>↓</span>}
                    {Number(actualYield) === predictedYield && <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 'bold' }}>—</span>}
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
