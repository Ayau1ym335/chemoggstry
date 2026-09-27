import React from 'react';
import './HistoryTable.css';

export default function HistoryTable({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="history-table-container glass-panel slide-up">
      <h3>Experiment History</h3>
      <div className="table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Exp #</th>
              <th>Temp (°C)</th>
              <th>Conc. (M)</th>
              <th>Catalyst</th>
              <th>Time (min)</th>
              <th>Yield (%)</th>
            </tr>
          </thead>
          <tbody>
            {history.map((run) => (
              <tr key={run.iterationNumber}>
                <td>{run.iterationNumber}</td>
                <td>{run.conditions.temperature}</td>
                <td>{run.conditions.concentration}</td>
                <td>{run.conditions.catalyst}</td>
                <td>{run.conditions.time}</td>
                <td className="highlight-yield">{run.actualYield.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
