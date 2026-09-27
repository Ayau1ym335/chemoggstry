import React from 'react';
import './ReactionDetail.css';

export default function ReactionDetail({ reaction, onOptimize }) {
  if (!reaction) return null;

  // Derived type like "Neutralization(ionic)"
  const baseName = reaction.name.split(':')[0] || reaction.name;
  const reactionType = `${baseName}(${reaction.bondingType})`;

  return (
    <div className="reaction-detail-panel glass-panel slide-up">
      <div className="detail-content">
        <h3>Reaction Details</h3>
        
        <div className="detail-row">
          <span className="detail-label">Equation:</span>
          <span className="detail-value equation-box">{reaction.equation}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Reaction type (bonding type):</span>
          <span className="detail-value">{reactionType}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Reaction possible:</span>
          <span className="detail-value success-text">
            <span className="check-icon">✓</span> Yes
          </span>
        </div>
      </div>

      <div className="detail-actions">
        <button className="primary-action-btn" onClick={onOptimize}>
          OPTIMIZE REACTION
        </button>
      </div>
    </div>
  );
}
