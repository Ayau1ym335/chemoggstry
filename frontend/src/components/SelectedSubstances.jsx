import React from 'react';

export default function SelectedSubstances({ symbols, onRemove, onCheck, checking }) {
  const canCheck = symbols.length >= 2;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
      {/* Label */}
      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', flexShrink: 0 }}>
        Selected:
      </span>

      {/* Chips or placeholder */}
      {symbols.length === 0 ? (
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          click elements below to select (need ≥2)
        </span>
      ) : (
        symbols.map((s) => (
          <button
            key={s}
            id={`substance-chip-${s}`}
            onClick={() => onRemove(s)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              background: 'var(--accent)', color: 'var(--text-light)',
              border: 'none', borderRadius: '999px',
              padding: '0.2rem 0.6rem', fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s ease',
            }}
            title={`Remove ${s}`}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
          >
            {s} <span style={{ opacity: 0.7, fontSize: '0.9em' }}>×</span>
          </button>
        ))
      )}

      {/* Count hint when ≥2 */}
      {symbols.length === 1 && (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          select 1 more to check
        </span>
      )}

      {/* CHECK REACTION button */}
      <button
        id="check-reaction-btn"
        className="primary-action-btn"
        style={{ marginLeft: 'auto', fontSize: '0.85rem', padding: '0.45rem 1.1rem', flexShrink: 0 }}
        onClick={onCheck}
        disabled={!canCheck || checking}
      >
        {checking ? 'Checking…' : 'CHECK REACTION'}
      </button>
    </div>
  );
}
