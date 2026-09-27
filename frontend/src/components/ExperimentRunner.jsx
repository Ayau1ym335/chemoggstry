import React, { useState } from 'react';
import './ExperimentRunner.css';

export default function ExperimentRunner({ isEnabled }) {
  // States: 'idle' | 'loading' | 'result'
  const [status, setStatus] = useState('idle');

  // Mock conditions based on the PRD example
  const mockConditions = {
    temperature: 60,
    concentration: 0.5,
    catalyst: 'None',
    time: 30
  };

  const handleRun = () => {
    setStatus('loading');
    
    // Simulate a brief network delay so the loading state is visible
    setTimeout(() => {
      setStatus('result');
    }, 800);
  };

  const handleNext = () => {
    // In TASK 29 this will trigger fetching the next conditions
    // For now, it just resets the UI
    setStatus('idle');
  };

  return (
    <div className={`experiment-runner-panel glass-panel ${!isEnabled ? 'disabled' : ''}`}>
      <div className="panel-header">
        <h3>Current Iteration (Experiment #1)</h3>
      </div>
      
      <div className="conditions-grid">
        <div className="condition-item">
          <span className="condition-label">Temperature</span>
          <span className="condition-value">{mockConditions.temperature} °C</span>
        </div>
        <div className="condition-item">
          <span className="condition-label">Concentration</span>
          <span className="condition-value">{mockConditions.concentration} M</span>
        </div>
        <div className="condition-item">
          <span className="condition-label">Catalyst</span>
          <span className="condition-value">{mockConditions.catalyst}</span>
        </div>
        <div className="condition-item">
          <span className="condition-label">Reaction Time</span>
          <span className="condition-value">{mockConditions.time} min</span>
        </div>
      </div>

      <div className="runner-actions">
        {status === 'idle' && (
          <button 
            className="primary-action-btn run-btn" 
            onClick={handleRun}
            disabled={!isEnabled}
          >
            RUN EXPERIMENT
          </button>
        )}

        {status === 'loading' && (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Running simulation...</span>
          </div>
        )}

        {status === 'result' && (
          <div className="result-state slide-up">
            <div className="yield-display">
              <span className="yield-label">Predicted result:</span>
              <span className="yield-value">72% yield</span>
            </div>
            <button className="secondary-action-btn" onClick={handleNext}>
              NEXT ITERATION
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
