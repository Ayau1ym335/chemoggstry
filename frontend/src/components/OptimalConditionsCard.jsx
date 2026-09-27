import React from 'react';
import './OptimalConditionsCard.css';

export default function OptimalConditionsCard({ optimalRun }) {
  if (!optimalRun) return null;

  return (
    <div className="optimal-card glass-panel slide-up highlight-pulse">
      <div className="optimal-header">
        <div className="optimal-title-group">
          <span className="trophy-icon">🏆</span>
          <h3>Optimal Conditions</h3>
        </div>
        <div className="best-result-badge">
          Best result: Yield {optimalRun.actualYield.toFixed(1)}%
        </div>
      </div>
      
      <div className="optimal-body">
        <div className="optimal-condition">
          <span className="opt-label">Temperature</span>
          <span className="opt-value">{optimalRun.conditions.temperature} °C</span>
        </div>
        <div className="optimal-condition">
          <span className="opt-label">Concentration</span>
          <span className="opt-value">{optimalRun.conditions.concentration} M</span>
        </div>
        <div className="optimal-condition">
          <span className="opt-label">Catalyst</span>
          <span className="opt-value">{optimalRun.conditions.catalyst}</span>
        </div>
        <div className="optimal-condition">
          <span className="opt-label">Reaction time</span>
          <span className="opt-value">{optimalRun.conditions.time} min</span>
        </div>
      </div>
    </div>
  );
}
