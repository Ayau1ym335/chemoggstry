import React from 'react';

const CATEGORY_COLORS = {
  'non-metal':  { bg: '#fdf6ef', border: '#fbdca8', color: '#7a3b1e', label: 'Non-metal' },
  'metal':      { bg: '#eff6ff', border: '#bfdbfe', color: '#1e3a8a', label: 'Metal' },
  'metalloid':  { bg: '#f0fdf4', border: '#bbf7d0', color: '#14532d', label: 'Metalloid' },
  'noble-gas':  { bg: '#f5f3ff', border: '#ddd6fe', color: '#4c1d95', label: 'Noble gas' },
};

export default function ElementInfoPanel({ element, onClose }) {
  if (!element) return null;

  const cat = CATEGORY_COLORS[element.category] || {};

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(30,18,11,0.55)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--surface)',
        borderRadius: '12px',
        padding: '1.75rem 2rem',
        width: 340,
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        animation: 'popIn 0.2s ease',
        position: 'relative',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '1.25rem', lineHeight: 1, padding: 0,
          }}
          aria-label="Close"
        >×</button>

        {/* Element identity block */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 10, flexShrink: 0,
            background: cat.bg, border: `2px solid ${cat.border}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '0.65rem', color: cat.color, opacity: 0.8 }}>{element.atomicNumber}</span>
            <strong style={{ fontSize: '1.75rem', fontWeight: 800, color: cat.color, lineHeight: 1.1 }}>{element.symbol}</strong>
          </div>
          <div>
            <h2 style={{ margin: '0 0 0.2rem', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)' }}>
              {element.name}
            </h2>
            <span style={{
              display: 'inline-block',
              background: cat.bg, border: `1px solid ${cat.border}`, color: cat.color,
              borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
              padding: '0.15rem 0.55rem', textTransform: 'capitalize',
            }}>
              {cat.label}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Atomic number', value: element.atomicNumber },
            { label: 'Group', value: element.group },
            { label: 'Period', value: element.period },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'var(--surface-2)', borderRadius: '6px',
              padding: '0.6rem 0.85rem', border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)', marginTop: 2 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Short description */}
        {element.shortDescription && (
          <p style={{
            margin: 0, fontSize: '0.88rem', lineHeight: 1.6,
            color: 'var(--text-mid)', borderTop: '1px solid var(--border)', paddingTop: '1rem',
          }}>
            {element.shortDescription}
          </p>
        )}
      </div>
    </div>
  );
}
