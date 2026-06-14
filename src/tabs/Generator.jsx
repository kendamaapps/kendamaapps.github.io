import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router';
import tricks from '../../data/structured_tricks.json';

export default function Generator({ onLogTrick, generatedTricks = [], setGeneratedTricks }) {
  const { event } = useParams();
  const navigate = useNavigate();

  // Decode URL parameters safely back to normal text
  const selectedEvent = event ? decodeURIComponent(event) : null;

  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [availableTricks, setAvailableTricks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* =========================================================================
     💡 NEW: THEME INTERCEPTOR EFFECT
     ========================================================================= */
  useEffect(() => {
    // Check if the current URL path parameter is exactly 'VanJam'
    if (selectedEvent === 'Van Jam') {
      document.body.setAttribute('data-theme', 'vanjam');
    } else {
      // Revert instantly to the core blue layout elsewhere
      document.body.removeAttribute('data-theme');
    }

    // Safety cleanup rule: removes theme styling if the user unmounts or switches tabs completely
    return () => {
      document.body.removeAttribute('data-theme');
    };
  }, [selectedEvent]);

  /* =========================
     INDEX (FAST EVENT LOOKUP)
     ========================= */
  const indexed = useMemo(() => {
    const map = new Map();
    for (const entry of tricks) {
      if (!map.has(entry.event)) {
        map.set(entry.event, []);
      }
      map.get(entry.event).push(entry);
    }
    return map;
  }, []);

  /* =========================
     EVENT OPTIONS
     ========================= */
  const events = useMemo(() => {
    return ['All', ...indexed.keys()];
  }, [indexed]);

  /* =========================
     YEAR OPTIONS (EVENT-AWARE)
     ========================= */
  const years = useMemo(() => {
    if (!selectedEvent) return ['All'];
    const base =
      selectedEvent === 'All'
        ? tricks
        : indexed.get(selectedEvent) || [];
    const set = new Set(base.map(e => e.year));
    return ['All', ...Array.from(set)].sort((a, b) =>
      a === 'All' ? -1 : b - a
    );
  }, [selectedEvent, indexed]);

  /* =========================
     DIFFICULTY OPTIONS (EVENT + YEAR-AWARE)
     ========================= */
  const difficulties = useMemo(() => {
    if (!selectedEvent) return ['All'];
    const base =
      selectedEvent === 'All'
        ? tricks
        : indexed.get(selectedEvent) || [];
    const filtered =
      selectedYear === 'All'
        ? base
        : base.filter(e => e.year === Number(selectedYear));
    const set = new Set();
    for (const entry of filtered) {
      Object.keys(entry.tricks).forEach(d => set.add(d));
    }
    return ['All', ...Array.from(set)];
  }, [selectedEvent, selectedYear, indexed]);

  /* =========================
     FILTERED TRICK POOL
     ========================= */
  useEffect(() => {
    if (!selectedEvent) return;

    let base =
      selectedEvent === 'All'
        ? tricks
        : indexed.get(selectedEvent) || [];

    if (selectedYear !== 'All') {
      base = base.filter(e => e.year === Number(selectedYear));
    }

    const filtered = [];
    for (const entry of base) {
      for (const [difficulty, list] of Object.entries(entry.tricks)) {
        const difficultyOk =
          selectedDifficulty === 'All' ||
          difficulty === selectedDifficulty;
        if (!difficultyOk) continue;
        filtered.push(...list);
      }
    }
    setAvailableTricks(filtered);
  }, [selectedEvent, selectedYear, selectedDifficulty, indexed]);

  /* =========================
     ACTIONS
     ========================= */
  function handleEventSelect(newEventName) {
    setSelectedYear('All');
    setSelectedDifficulty('All');
    
    if (newEventName === 'All') {
      navigate('/generator/All');
    } else {
      navigate(`/generator/${encodeURIComponent(newEventName)}`);
    }
  }

  function generateTrick() {
    if (!availableTricks.length) return;
    const randomIndex = Math.floor(Math.random() * availableTricks.length);
    const newTrick = availableTricks[randomIndex];
    setGeneratedTricks(prev => [newTrick, ...prev]);
  }

  function removeTrick(index) {
    setGeneratedTricks(prev => prev.filter((_, i) => i !== index));
  }

  function completeTrick(trickName, index) {
    if (onLogTrick) onLogTrick(trickName);
    removeTrick(index);
  }

  /* =========================================================================
     VIEW 1: CLEAN HOME HUB
     ========================================================================= */
  if (!selectedEvent) {
    return (
      <div className="card">
        <h2>Trick Generator</h2>
        <p style={{ marginBottom: '1.5rem' }}>Select an event to start generating tricks:</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {events.map((e) => (
            <div
              key={e}
              onClick={() => handleEventSelect(e)}
              style={{
                padding: '1.5rem 1rem',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                fontWeight: 600,
                background: 'rgba(26, 46, 69, 0.6)',
                border: '1px solid var(--color-border)',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={(el) => {
                el.currentTarget.style.transform = 'translateY(-2px)';
                el.currentTarget.style.borderColor = 'var(--color-text-secondary)';
              }}
              onMouseLeave={(el) => {
                el.currentTarget.style.transform = 'translateY(0)';
                el.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              {e === 'All' ? '🌐 All Events' : e}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* =========================================================================
     VIEW 2: WORKBENCH COMPONENT (Loaded when an event parameter is present)
     ========================================================================= */
  return (
    <div className="card">
      <div style={{ marginBottom: '1rem' }}>
        <Link 
          to="/generator" 
          style={{ 
            color: 'var(--color-text-secondary)', 
            textDecoration: 'none',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          ← Back to Events
        </Link>
      </div>

      <h2>{selectedEvent === 'All' ? 'All Events' : selectedEvent}</h2>
      
      {/* SUB-FILTERS (YEAR & DIFFICULTY) */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <div>
          <label>Year</label>
          <br />
          <select
            value={selectedYear}
            onChange={e => {
              setSelectedYear(e.target.value);
              setSelectedDifficulty('All');
            }}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Difficulty</label>
          <br />
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
          >
            {difficulties.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ACTION BUTTONS ROW */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button onClick={generateTrick} disabled={!availableTricks.length}>
          Generate Trick
        </button>

        {/* 💡 FIXED: Inherits identical colors and themes seamlessly */}
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!availableTricks.length}
        >
          View All Tricks ({availableTricks.length})
        </button>

        {/* 💡 FIXED: Inherits identical colors and handles disabled states cleanly */}
        <button
          onClick={() => setGeneratedTricks([])}
          disabled={!generatedTricks.length}
          style={{
            cursor: generatedTricks.length ? 'pointer' : 'not-allowed',
            opacity: generatedTricks.length ? 1 : 0.5
          }}
        >
          Clear Queue
        </button>
      </div>

      <p style={{ marginTop: '1rem' }}>
        Available tricks: {availableTricks.length}
      </p>

      {/* GENERATED LIST */}
      {generatedTricks.length > 0 && (
        <ul style={{ marginTop: '1rem', padding: 0, listStyle: 'none' }}>
          {generatedTricks.map((trick, index) => (
            <li key={`${trick}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
              <span>{trick}</span>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button onClick={() => completeTrick(trick, index)} style={{ background: 'transparent', border: 'none', color: '#4caf50', cursor: 'pointer', fontSize: '1.1rem' }} title="Mark as completed">✓</button>
                <button onClick={() => removeTrick(index)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.1rem' }} title="Remove from list">×</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* =========================================================================
         POPUP MODAL COMPONENT (Wrapped in a Portal to break out of Stacking Contexts)
         ========================================================================= */}
      {isModalOpen && createPortal(
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title">
                Active Trick Pool ({availableTricks.length})
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <div className="modal-meta">
                Filters: {selectedEvent} • Year: {selectedYear} • Diff: {selectedDifficulty}
              </div>

              <ul className="modal-list">
                {availableTricks.map((trick, idx) => (
                  <li key={`${trick}-${idx}`} className="modal-item">
                    {idx + 1}. {trick}
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body // 💡 This targets the global HTML body tag
      )}
    </div>
  );
}