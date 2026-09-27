import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/appState';
import GoalSelector from '../../components/GoalSelector';
import ExperimentRunner from '../../components/ExperimentRunner';
import { mockHistory } from '../../components/mockData';
import HistoryTable from '../../components/HistoryTable';
import YieldChart from '../../components/YieldChart';
import OptimalConditionsCard from '../../components/OptimalConditionsCard';

export default function OptimizerPage() {
  const { selectedReaction } = useAppState();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);

  const isFinal = mockHistory.length === 4;
  const optimalRun = isFinal ? mockHistory[mockHistory.length - 1] : null;

  return (
    <div className="page-content">
      <h1 className="page-title">Optimizer</h1>
      <p className="page-subtitle">Set your goal and run experiments to find optimal conditions.</p>

      {selectedReaction ? (
        <>
          {/* Active reaction header */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 0 }}>Active Reaction</div>
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{selectedReaction.name}</span>
              <span className="detail-value equation-box">{selectedReaction.equation}</span>
              <button
                className="secondary-action-btn"
                style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
                onClick={() => navigate('/reactions')}
              >
                Change
              </button>
            </div>
          </div>

          <GoalSelector selectedGoal={goal} onSelectGoal={setGoal} />

          <ExperimentRunner isEnabled={!!goal} />

          {mockHistory && mockHistory.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ flex: '1 1 480px' }}>
                <HistoryTable history={mockHistory} />
              </div>
              <div style={{ flex: '1 1 360px' }}>
                <YieldChart history={mockHistory} />
              </div>
            </div>
          )}

          {isFinal && <OptimalConditionsCard optimalRun={optimalRun} />}
        </>
      ) : (
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
      )}
    </div>
  );
}
