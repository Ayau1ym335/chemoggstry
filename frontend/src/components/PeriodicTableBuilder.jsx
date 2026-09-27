import React, { useState, useEffect, useCallback } from 'react';
import { fetchElements, checkReaction } from '../api/elementsApi';
import PeriodicTable from './PeriodicTable';
import ElementSearch from './ElementSearch';
import ElementInfoPanel from './ElementInfoPanel';
import SelectedSubstances from './SelectedSubstances';
import { LoadingState, ErrorState } from './SharedStates';

export default function PeriodicTableBuilder({ onCheckReaction }) {
  const [elements, setElements]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [selectedSymbols, setSelectedSymbols] = useState([]);
  const [checking, setChecking]               = useState(false);
  const [checkResult, setCheckResult]         = useState(null); // null | { reactionPossible, reaction? }
  const [searchQuery, setSearchQuery]         = useState('');
  const [infoElement, setInfoElement]         = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchElements()
      .then((data) => { if (!cancelled) { setElements(data); setLoading(false); } })
      .catch((err)  => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  // Toggle an element; clear stale result when selection changes
  const handleElementSelect = useCallback((symbol) => {
    setCheckResult(null);
    setSelectedSymbols((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  }, []);

  const handleRemove = useCallback((symbol) => {
    setCheckResult(null);
    setSelectedSymbols((prev) => prev.filter((s) => s !== symbol));
  }, []);

  const handleCheck = async () => {
    if (selectedSymbols.length < 2) return;
    setChecking(true);
    setCheckResult(null);
    try {
      const result = await checkReaction(selectedSymbols);
      setCheckResult(result);
      if (result.reactionPossible) {
        onCheckReaction(result.reaction.id);
      }
    } catch (err) {
      setCheckResult({ reactionPossible: false, _error: err.message });
    } finally {
      setChecking(false);
    }
  };

  if (loading) return <LoadingState message="Loading periodic table…" inline />;
  if (error)   return <ErrorState title="Failed to load elements" message={error} inline />;

  return (
    <div>
      {/* ── Search + SelectedSubstances toolbar ─────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <ElementSearch query={searchQuery} onChange={(q) => { setSearchQuery(q); }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <SelectedSubstances
            symbols={selectedSymbols}
            onRemove={handleRemove}
            onCheck={handleCheck}
            checking={checking}
          />
        </div>
      </div>

      {/* ── Check Reaction result banner ─────────────────────────── */}
      {checkResult && (
        checkResult.reactionPossible ? (
          // Success: green — reaction found
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem',
            background: 'var(--green-bg)', border: '1px solid #a8d5b8',
            color: 'var(--green)', fontWeight: 600, fontSize: '0.88rem',
          }}>
            ✓ Reaction found: <em>{checkResult.reaction.equation}</em> — see details below.
          </div>
        ) : (
          // Not found: neutral amber — this is expected business logic, not an error
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem',
            background: '#fffbeb', border: '1px solid #fcd34d',
            color: '#92400e', fontWeight: 500, fontSize: '0.88rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{ fontSize: '1.1rem' }}>🔍</span>
            No matching reaction found for this combination.
            Try a different set of elements.
          </div>
        )
      )}

      {/* ── Periodic Table grid ──────────────────────────────────── */}
      <PeriodicTable
        elements={elements}
        selectedSymbols={selectedSymbols}
        onElementSelect={handleElementSelect}
        onElementInfo={setInfoElement}
        filterQuery={searchQuery}
      />

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
        MVP subset · double-click any element for details · select ≥2 elements then "Check Reaction"
      </p>

      {/* ── Element Info modal ───────────────────────────────────── */}
      {infoElement && (
        <ElementInfoPanel element={infoElement} onClose={() => setInfoElement(null)} />
      )}
    </div>
  );
}
