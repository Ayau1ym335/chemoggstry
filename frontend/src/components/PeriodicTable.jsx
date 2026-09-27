import React from 'react';
import './PeriodicTable.css';

export default function PeriodicTable({ elements, selectedSymbols, onElementSelect, onElementInfo, filterQuery }) {
  if (!elements || elements.length === 0) return null;

  const q = filterQuery ? filterQuery.toLowerCase().trim() : '';

  const matchesQuery = (el) => {
    if (!q) return true;
    return el.symbol.toLowerCase().includes(q) || el.name.toLowerCase().includes(q);
  };

  return (
    <div className="periodic-table-grid">
      {elements.map((el) => {
        const isSelected = selectedSymbols.includes(el.symbol);
        const isMatch = matchesQuery(el);
        const isDimmed = q && !isMatch;

        return (
          <div
            key={el.symbol}
            className={`element-cell category-${el.category} ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''}`}
            style={{ gridColumn: el.group, gridRow: el.period }}
            onClick={() => onElementSelect(el.symbol)}
            onDoubleClick={() => onElementInfo && onElementInfo(el)}
            title={`${el.name} — double-click for details`}
          >
            <span className="element-atomic">{el.atomicNumber}</span>
            <strong className="element-symbol">{el.symbol}</strong>
          </div>
        );
      })}
    </div>
  );
}
