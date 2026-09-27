import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/appState';
import { fetchReactions } from '../../api/reactionsApi';
import { LoadingState, ErrorState } from '../../components/SharedStates';
import ReactionDetail from '../../components/ReactionDetail';
import PeriodicTableBuilder from '../../components/PeriodicTableBuilder';

export default function ReactionsPage() {
  const { selectedReaction, setSelectedReaction } = useAppState();
  const navigate = useNavigate();

  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('quick'); // 'quick' | 'periodic'

  const loadData = useCallback(() => {
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

  useEffect(() => {
    const cleanup = loadData();
    return cleanup;
  }, [loadData]);

  const handleSelectReaction = (id) => {
    if (selectedReaction && selectedReaction.id === id) return;
    const reaction = reactions.find((r) => r.id === id);
    setSelectedReaction(reaction);
  };

  const handleOptimize = () => navigate('/optimizer');

  if (loading) {
    return (
      <div className="page-content">
        <h1 className="page-title">Reaction Database</h1>
        <LoadingState message="Loading reactions…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <h1 className="page-title">Reaction Database</h1>
        <ErrorState 
          title="Could not reach the server" 
          message={<>Make sure the backend is running on port 4000.<br/><code>{error}</code></>}
          onRetry={loadData}
        />
      </div>
    );
  }

  /* ── Data ────────────────────────────────────────────────── */
  return (
    <div className="page-content">
      <h1 className="page-title">Reaction Database</h1>
      <p className="page-subtitle">Select a reaction to begin optimization.</p>

      {/* ── Mode Toggle ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <button 
          className={`tab-btn ${mode === 'quick' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', color: mode === 'quick' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: mode === 'quick' ? '600' : '400', cursor: 'pointer', fontSize: '1rem' }}
          onClick={() => setMode('quick')}
        >
          Quick Select
        </button>
        <button 
          className={`tab-btn ${mode === 'periodic' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', color: mode === 'periodic' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: mode === 'periodic' ? '600' : '400', cursor: 'pointer', fontSize: '1rem' }}
          onClick={() => setMode('periodic')}
        >
          Browse by Periodic Table
        </button>
      </div>

      {mode === 'quick' && (
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
      )}

      {mode === 'periodic' && (
        <PeriodicTableBuilder onCheckReaction={handleSelectReaction} />
      )}

      {selectedReaction && (
        <div style={{ marginTop: '2rem' }}>
          <ReactionDetail reaction={selectedReaction} onOptimize={handleOptimize} />
        </div>
      )}
    </div>
  );
}
