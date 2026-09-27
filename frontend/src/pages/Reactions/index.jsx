import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/appState';
import { fetchReactions } from '../../api/reactionsApi';

export default function ReactionsPage() {
  const { selectedReaction, setSelectedReaction } = useAppState();
  const navigate = useNavigate();

  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reactions once on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchReactions()
      .then((data) => {
        if (!cancelled) setReactions(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleSelectReaction = (id) => {
    if (selectedReaction && selectedReaction.id === id) return;
    // Find in already-loaded list — no second HTTP call (MVP optimisation)
    const reaction = reactions.find((r) => r.id === id);
    setSelectedReaction(reaction);
  };

  const handleOptimize = () => navigate('/optimizer');

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="page-content">
        <h1 className="page-title">Reaction Database</h1>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-state" style={{ justifyContent: 'center' }}>
            <div className="spinner"></div>
            <span>Loading reactions…</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="page-content">
        <h1 className="page-title">Reaction Database</h1>
        <div className="card" style={{ textAlign: 'center', padding: '3rem', borderLeft: '4px solid #b91c1c' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <div className="card-title" style={{ color: '#b91c1c' }}>Could not reach the server</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Make sure the backend is running on port 4000.
          </p>
          <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </code>
        </div>
      </div>
    );
  }

  /* ── Data ────────────────────────────────────────────────── */
  return (
    <div className="page-content">
      <h1 className="page-title">Reaction Database</h1>
      <p className="page-subtitle">Select a reaction to begin optimization.</p>

      <div className="reaction-grid">
        {reactions.map((reaction) => {
          const isSelected = selectedReaction?.id === reaction.id;
          return (
            <div
              key={reaction.id}
              className={`reaction-card${isSelected ? ' selected' : ''}`}
              onClick={() => handleSelectReaction(reaction.id)}
            >
              <div>
                <div className="reaction-name">{reaction.name}</div>
                <div className="reaction-eq">{reaction.equation}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`badge ${reaction.bondingType}`}>{reaction.bondingType}</span>
                <span className="arrow-icon">›</span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedReaction && (
        <div className="reaction-detail-panel slide-up">
          <div className="detail-content">
            <h3>Selected Reaction</h3>
            <div className="detail-row">
              <span className="detail-label">Equation:</span>
              <span className="detail-value equation-box">{selectedReaction.equation}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Reaction type (bonding type):</span>
              <span className="detail-value">
                {selectedReaction.name.split(':')[0]}({selectedReaction.bondingType})
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Reaction possible:</span>
              <span className="detail-value success-text">✓ Yes</span>
            </div>
          </div>
          <div>
            <button className="primary-action-btn" onClick={handleOptimize}>
              OPTIMIZE REACTION →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
