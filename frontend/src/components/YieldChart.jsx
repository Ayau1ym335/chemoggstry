import React from 'react';
import './YieldChart.css';

export default function YieldChart({ history }) {
  if (!history || history.length === 0) return null;

  const width = 500;
  const height = 300;
  const paddingX = 50;
  const paddingY = 40;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Maximum yield for the Y-axis scale (0-100%)
  const maxY = 100;

  return (
    <div className="yield-chart-container glass-panel slide-up">
      <h3>Yield Progression</h3>
      <div className="svg-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="yield-svg">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(val => {
            const y = height - paddingY - (val / maxY) * chartH;
            return (
              <g key={val}>
                <line 
                  x1={paddingX} y1={y} 
                  x2={width - paddingX + 20} y2={y} 
                  className="grid-line" 
                />
                <text 
                  x={paddingX - 10} y={y + 4} 
                  className="axis-label" 
                  textAnchor="end"
                >
                  {val}%
                </text>
              </g>
            );
          })}
          
          {/* Bars */}
          {history.map((run, i) => {
            const numBars = Math.max(history.length, 4); // Distribute space for up to 4 bars
            const barW = Math.min(40, (chartW / numBars) * 0.6);
            const gap = (chartW - barW * numBars) / (numBars + 1);
            const x = paddingX + gap + i * (barW + gap);
            
            const barH = (run.actualYield / maxY) * chartH;
            const y = height - paddingY - barH;

            // Connect lines
            const isLast = i === history.length - 1;
            let line = null;
            if (!isLast) {
              const nextRun = history[i + 1];
              const nextBarH = (nextRun.actualYield / maxY) * chartH;
              const nextY = height - paddingY - nextBarH;
              const nextX = paddingX + gap + (i + 1) * (barW + gap);
              line = (
                <line 
                  x1={x + barW / 2} y1={y} 
                  x2={nextX + barW / 2} y2={nextY} 
                  className="trend-line" 
                />
              );
            }

            return (
              <g key={run.iterationNumber} className="bar-group">
                {line}
                
                <rect 
                  x={x} 
                  y={y} 
                  width={barW} 
                  height={barH} 
                  rx={4}
                  className="bar-rect"
                />
                
                <circle cx={x + barW / 2} cy={y} r={4} className="bar-point" />

                <text x={x + barW / 2} y={y - 12} textAnchor="middle" className="bar-label">
                  {run.actualYield.toFixed(1)}%
                </text>
                
                <text x={x + barW / 2} y={height - paddingY + 20} textAnchor="middle" className="axis-label-x">
                  #{run.iterationNumber}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
