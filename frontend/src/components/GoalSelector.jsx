import React from 'react';
import './GoalSelector.css';

export default function GoalSelector({ selectedGoal, onSelectGoal }) {
  return (
    <div className="goal-selector-panel glass-panel">
      <h3>What do you want to optimize?</h3>
      <div className="goal-options">
        <label className={`goal-option ${selectedGoal === 'maxYield' ? 'selected' : ''}`}>
          <input 
            type="radio" 
            name="optimization_goal" 
            value="maxYield"
            checked={selectedGoal === 'maxYield'}
            onChange={() => onSelectGoal('maxYield')}
          />
          <div className="goal-option-content">
            <span className="goal-title">Maximum Yield</span>
            <span className="goal-desc">Optimize for the highest possible product conversion</span>
          </div>
        </label>

        <label className={`goal-option ${selectedGoal === 'minTime' ? 'selected' : ''}`}>
          <input 
            type="radio" 
            name="optimization_goal" 
            value="minTime"
            checked={selectedGoal === 'minTime'}
            onChange={() => onSelectGoal('minTime')}
          />
          <div className="goal-option-content">
            <span className="goal-title">Minimum Reaction Time</span>
            <span className="goal-desc">Find the fastest reaction conditions with acceptable yield</span>
          </div>
        </label>

        <label className="goal-option disabled" title="Coming soon in a future update">
          <input 
            type="radio" 
            name="optimization_goal" 
            value="minEnergy"
            disabled
          />
          <div className="goal-option-content">
            <span className="goal-title">
              Minimum Energy Consumption 
              <span className="coming-soon-badge">Coming soon</span>
            </span>
            <span className="goal-desc">Optimize for lowest temperature and pressure footprint</span>
          </div>
        </label>
      </div>
    </div>
  );
}
