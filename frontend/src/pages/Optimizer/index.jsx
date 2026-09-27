import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/appState';
import GoalSelector from '../../components/GoalSelector';
import HistoryTable from '../../components/HistoryTable';
import YieldChart from '../../components/YieldChart';
import OptimalConditionsCard from '../../components/OptimalConditionsCard';
import { createRun, getNextConditions, runExperiment, getOptimal } from '../../api/runsApi';

// ─── Experiment status machine ──────────────────────────────────────────────
// 'setup'       → goal not chosen yet
// 'ready'       → goal chosen, waiting for "Start" click
// 'fetching'    → fetching /next conditions
// 'idle'        → conditions shown, waiting for "Run Experiment"
// 'running'     → POST /experiment in-flight
// 'completed'   → run finished, optimal card visible
// ────────────────────────────────────────────────────────────────────────────

export default function OptimizerPage() {
  const { selectedReaction, setActiveRunId } = useAppState();
  const navigate = useNavigate();

  const [goal, setGoal]                         = useState(null);
  const [phase, setPhase]                       = useState('setup');
  const [runId, setRunId]                       = useState(null);
  const [suggestedConditions, setSuggested]     = useState(null);
  const [history, setHistory]                   = useState([]);
  const [optimal, setOptimal]                   = useState(null);
  const [iterationError, setIterationError]     = useState(null);

  // ── Start: create run + fetch first suggested conditions ──────────────────
  const handleStart = useCallback(async () => {
    if (!selectedReaction || !goal) return;
    setPhase('fetching');
    setIterationError(null);
    setHistory([]);
    setOptimal(null);

    try {
      const run = await createRun({ reactionId: selectedReaction.id, goal });
      setRunId(run.id);
      setActiveRunId(run.id); // Save to global state for AI Assistant
      const suggested = await getNextConditions(run.id);
      setSuggested(suggested);
      setPhase('idle');
    } catch (err) {
      setIterationError(err.message);
      setPhase('ready');
    }
  }, [selectedReaction, goal, setActiveRunId]);

  // ── Run one experiment iteration ──────────────────────────────────────────
  const handleRunExperiment = useCallback(async () => {
    if (!runId || !suggestedConditions || phase !== 'idle') return;
    setPhase('running');
    setIterationError(null);

    try {
      const { iteration, runStatus } = await runExperiment(runId, suggestedConditions);

      // Accumulate history client-side from iteration returned by server (option b: server is source of truth)
      setHistory((prev) => [...prev, iteration]);

      if (runStatus === 'completed') {
        // Fetch optimal and show final card
        const optimalData = await getOptimal(runId);
        setOptimal(optimalData.optimal);
        setPhase('completed');
      } else {
        // Fetch next suggested conditions for the following iteration
        const suggested = await getNextConditions(runId);
        setSuggested(suggested);
        setPhase('idle');
      }
    } catch (err) {
      setIterationError(err.message);
      setPhase('idle'); // Let user retry rather than getting stuck
    }
  }, [runId, suggestedConditions, phase]);

  // ── Reset everything (start over with a new run) ──────────────────────────
  const handleReset = () => {
    setGoal(null);
    setPhase('setup');
    setRunId(null);
    setActiveRunId(null); // Clear from global state
    setSuggested(null);
    setHistory([]);
    setOptimal(null);
    setIterationError(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (!selectedReaction) {
    return (
      <div className="page-content">
        <h1 className="page-title">Optimizer</h1>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚙️</div>
          <div className="card-title">No Reaction Selected</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Please select a reaction from the database first.
          </p>
          <button className="primary-action-btn" onClick={() => navigate('/reactions')}>
            Go to Database →
          </button>
        </div>
      </div>
    );
  }

  const iterationCount = history.length;
  const maxIterations  = 4;
  const progressPct    = (iterationCount / maxIterations) * 100;

  return (
    <div className="page-content">
      <h1 className="page-title">Optimizer</h1>
      <p className="page-subtitle">Set your goal and run experiments to find optimal conditions.</p>

      {/* ── Active reaction header ──────────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Active Reaction</div>
            <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{selectedReaction.name}</span>
          </div>
          <span className="detail-value equation-box">{selectedReaction.equation}</span>
          {phase === 'setup' && (
            <button
              className="secondary-action-btn"
              style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              onClick={() => navigate('/reactions')}
            >
              Change
            </button>
          )}
          {phase !== 'setup' && (
            <button
              className="secondary-action-btn"
              style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              onClick={handleReset}
            >
              ↺ New Run
            </button>
          )}
        </div>
      </div>

      {/* ── Goal selector (setup phase only) ───────────────────────────── */}
      {phase === 'setup' && (
        <GoalSelector selectedGoal={goal} onSelectGoal={(g) => { setGoal(g); setPhase('ready'); }} />
      )}

      {/* ── Goal summary (post-setup) ───────────────────────────────────── */}
      {phase !== 'setup' && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Goal:</span>
          <strong>{goal === 'maxYield' ? '📈 Maximum Yield' : '⏱ Minimum Reaction Time'}</strong>
          {iterationCount > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Iteration {iterationCount}/{maxIterations}</span>
              <div style={{ width: 120, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--accent)', borderRadius: 3, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Start button (ready phase) ─────────────────────────────────── */}
      {phase === 'ready' && (
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <button className="primary-action-btn" onClick={handleStart}>
            START OPTIMIZATION →
          </button>
        </div>
      )}

      {/* ── Experiment runner (fetching / idle / running) ───────────────── */}
      {(phase === 'fetching' || phase === 'idle' || phase === 'running') && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            Experiment #{iterationCount + 1} — Suggested Conditions
          </div>

          {phase === 'fetching' ? (
            <div className="loading-state" style={{ justifyContent: 'center', padding: '1rem 0' }}>
              <div className="spinner"></div>
              <span>Calculating next conditions…</span>
            </div>
          ) : (
            <>
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

              <div className="runner-actions" style={{ marginTop: '0.5rem' }}>
                {phase === 'running' ? (
                  <div className="loading-state" style={{ justifyContent: 'center', width: '100%' }}>
                    <div className="spinner"></div>
                    <span>Running simulation…</span>
                  </div>
                ) : (
                  <button
                    className="primary-action-btn run-btn"
                    onClick={handleRunExperiment}
                    disabled={phase !== 'idle'}
                  >
                    RUN EXPERIMENT
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Error banner ────────────────────────────────────────────────── */}
      {iterationError && (
        <div className="card slide-up" style={{ marginTop: '1rem', borderLeft: '4px solid #b91c1c', background: '#fff5f5' }}>
          <span style={{ color: '#b91c1c', fontWeight: 600 }}>⚠️ {iterationError}</span>
        </div>
      )}

      {/* ── History table + chart ────────────────────────────────────────── */}
      {history.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ flex: '1 1 480px' }}>
            <HistoryTable history={history} />
          </div>
          <div style={{ flex: '1 1 360px' }}>
            <YieldChart history={history} />
          </div>
        </div>
      )}

      {/* ── Optimal Conditions card ──────────────────────────────────────── */}
      {phase === 'completed' && optimal && (
        <OptimalConditionsCard optimalRun={optimal} />
      )}
    </div>
  );
}
