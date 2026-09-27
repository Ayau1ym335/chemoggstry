import React from 'react';
import './ReactionCard.css';

export default function ReactionCard({ reaction, isSelected, onSelect }) {
  return (
    <div 
      className={`reaction-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(reaction.id)}
    >
      <div className="card-header">
        <h3 className="reaction-name">{reaction.name}</h3>
        <span className={`badge ${reaction.bondingType}`}>
          {reaction.bondingType}
        </span>
      </div>
      <div className="card-body">
        <div className="equation-container">
          <span className="equation">{reaction.equation}</span>
        </div>
      </div>
      {isSelected && (
        <div className="selected-indicator">
          <span className="check-icon">✓</span> Selected
        </div>
      )}
    </div>
  );
}
