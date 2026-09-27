import React from 'react';

export default function ElementSearch({ query, onChange }) {
  return (
    <div style={{ position: 'relative', maxWidth: 260 }}>
      <span style={{
        position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)',
        color: 'var(--text-muted)', fontSize: '0.9rem', pointerEvents: 'none'
      }}>🔍</span>
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search element or symbol…"
        style={{
          width: '100%',
          padding: '0.45rem 0.75rem 0.45rem 2rem',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-dark)',
          fontSize: '0.88rem',
          fontFamily: 'inherit',
          outline: 'none',
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
      />
      {query && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '1rem', padding: '0', lineHeight: 1
          }}
          aria-label="Clear search"
        >×</button>
      )}
    </div>
  );
}
