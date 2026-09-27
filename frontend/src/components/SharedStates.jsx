import React from 'react';

export function LoadingState({ message = 'Loading…', inline = false }) {
  const content = (
    <div className="loading-state" style={{ justifyContent: 'center', padding: inline ? '1rem 0' : 0 }}>
      <div className="spinner"></div>
      <span>{message}</span>
    </div>
  );

  if (inline) return content;

  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      {content}
    </div>
  );
}

export function ErrorState({ title = 'An error occurred', message, onRetry, inline = false }) {
  const content = (
    <>
      {!inline && <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>}
      {title && <div className="card-title" style={{ color: '#b91c1c', marginBottom: '0.5rem' }}>{inline ? `⚠️ ${title}` : title}</div>}
      <p style={{ color: 'var(--text-muted)', marginBottom: onRetry ? '1.5rem' : 0 }}>
        {message}
      </p>
      {onRetry && (
        <button className="secondary-action-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </>
  );

  if (inline) {
    return (
      <div className="card slide-up" style={{ marginTop: '1rem', borderLeft: '4px solid #b91c1c', background: '#fdf6f6' }}>
        {content}
      </div>
    );
  }

  return (
    <div className="card slide-up" style={{ textAlign: 'center', padding: '3rem', borderLeft: '4px solid #b91c1c' }}>
      {content}
    </div>
  );
}

export function EmptyState({ icon = 'ℹ️', title = 'No Data', message, action }) {
  return (
    <div className="card slide-up" style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icon}</div>
      <div className="card-title">{title}</div>
      <p style={{ color: 'var(--text-muted)', marginBottom: action ? '1.5rem' : 0 }}>
        {message}
      </p>
      {action}
    </div>
  );
}
