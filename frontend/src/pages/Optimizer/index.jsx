import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/appState';
import GoalSelector from '../../components/GoalSelector';
import HistoryTable from '../../components/HistoryTable';
import YieldChart from '../../components/YieldChart';
import OptimalConditionsCard from '../../components/OptimalConditionsCard';
import ExperimentRunner from '../../components/ExperimentRunner';
import { createRun, getNextConditions, getOptimal } from '../../api/runsApi';
import { LoadingState, ErrorState, EmptyState } from '../../components/SharedStates';

// ─── Experiment status machine ──────────────────────────────────────────────
// 'setup'       → goal not chosen yet
// 'ready'       → goal chosen, waiting for "Start" click
// 'fetching'    → fetching /next conditions
// 'idle'        → conditions shown, waiting for user interaction in ExperimentRunner
// 'completed'   → run finished, optimal card visible
// ────────────────────────────────────────────────────────────────────────────

export default function OptimizerPage() {
  const { selectedReaction, setActiveRunId } = useAppState();
  const navigate = useNavigate();

  const [goal, setGoal]                         = useState(null);
  const [phase, setPhase]                       = useState('setup');
  const [runId, setRunId]                       = useState(null);
  const [maxIterations, setMaxIterations]       = useState(4);  // overwritten from server on start
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
      setMaxIterations(run.maxIterations ?? 4); // use server value; fall back to 4 for safety
      setActiveRunId(run.id); // Save to global state for AI Assistant
      const suggested = await getNextConditions(run.id);
      setSuggested(suggested);
      setPhase('idle');
    } catch (err) {
      setIterationError(err.message);
      setPhase('ready');
    }
  }, [selectedReaction, goal, setActiveRunId]);

  // ── Handle completed iteration from ExperimentRunner ──────────────────────
  const handleIterationComplete = useCallback(async (iteration, runStatus) => {
    setIterationError(null);
    setHistory((prev) => [...prev, iteration]);

    if (runStatus === 'completed') {
      try {
        const optimalData = await getOptimal(runId);
        setOptimal(optimalData.optimal);
        setPhase('completed');
      } catch (err) {
        setIterationError(err.message);
      }
    } else {
      setPhase('fetching');
      try {
        const suggested = await getNextConditions(runId);
        setSuggested(suggested);
        setPhase('idle');
      } catch (err) {
        setIterationError(err.message);
        setPhase('idle');
      }
    }
  }, [runId]);

  const handleReset = () => {
    setGoal(null);
    setPhase('setup');
    setRunId(null);
    setMaxIterations(4);
    setActiveRunId(null);
    setSuggested(null);
    setHistory([]);
    setOptimal(null);
    setIterationError(null);
  };

  if (!selectedReaction) {
    return (
      <div className="page-content">
        <h1 className="page-title">Optimizer</h1>
        <EmptyState 
          icon="⚙️"
          title="No Reaction Selected"
          message="Please select a reaction from the database first."
          action={
            <button className="primary-action-btn" onClick={() => navigate('/reactions')}>
              Go to Database →
            </button>
          }
        />
      </div>
    );
  }

  const iterationCount = history.length;
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
            <button className="secondary-action-btn" style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.35rem 0.85rem' }} onClick={() => navigate('/reactions')}>
              Change
            </button>
          )}
          {phase !== 'setup' && (
            <button className="secondary-action-btn" style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.35rem 0.85rem' }} onClick={handleReset}>
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

      {/* ── Error banner ────────────────────────────────────────────────── */}
      {iterationError && (
        <ErrorState title="Experiment Error" message={iterationError} inline />
      )}

      {/* ── Experiment runner (fetching / idle) ───────────────── */}
      {(phase === 'fetching' || phase === 'idle') && (
        phase === 'fetching' ? (
          <div className="card" style={{ marginTop: '1rem' }}>
            <LoadingState message="Calculating next conditions…" inline />
          </div>
        ) : (
          <ExperimentRunner
            runId={runId}
            suggestedConditions={suggestedConditions}
            iterationCount={iterationCount}
            onIterationComplete={handleIterationComplete}
          />
        )
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
