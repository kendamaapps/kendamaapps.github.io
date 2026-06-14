import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router';
import tricks from '../../data/structured_tricks.json';

export default function Generator({ onLogTrick, generatedTricks = [], setGeneratedTricks }) {
  const { event, year } = useParams();
  const navigate = useNavigate();

  /* =========================================================================
     FAST EVENT LOOKUP INDEX
     ========================================================================= */
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

  const events = useMemo(() => {
    return ['All', ...indexed.keys()];
  }, [indexed]);

  /* =========================================================================
     SLUG RESOLVER & VALIDATION
     ========================================================================= */
  const selectedEvent = useMemo(() => {
    if (!event) return null;
    if (event.toLowerCase() === 'all') return 'All';

    const matchedOriginalName = events.find(
      (e) => e.replace(/\s+/g, '').toLowerCase() === event.toLowerCase()
    );

    return matchedOriginalName;
  }, [event, events]);

  // Read year from URL param, fallback to 'All' if not explicitly defined
  const selectedYear = useMemo(() => {
    if (!year) return 'All';
    if (year.toLowerCase() === 'all') return 'All';
    return year;
  }, [year]);

  // Safety trigger: Redirect home if an invalid event slug is typed
  useEffect(() => {
    if (event && !selectedEvent) {
      console.warn(`Event "${event}" is invalid. Redirecting...`);
      navigate('/generator', { replace: true });
    }
  }, [event, selectedEvent, navigate]);

  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [availableTricks, setAvailableTricks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* =========================================================================
     THEME INTERCEPTOR EFFECT
     ========================================================================= */
  const isVanJam = selectedEvent === 'Van Jam';
  const is2026 = selectedYear === '2026' || selectedYear === 'All';

  useEffect(() => {
    if (isVanJam) {
      document.body.setAttribute('data-theme', is2026 ? 'vanjam-2026' : 'vanjam-2025');
    } else {
      document.body.removeAttribute('data-theme');
    }

    return () => {
      document.body.removeAttribute('data-theme');
    };
  }, [isVanJam, is2026]);

  /* =========================================================================
     ⚙️ DYNAMIC PARAM NAVIGATION HANDLERS
     ========================================================================= */
  function updateParamRouting(eventSlug, yearSlug) {
    const cleanEvent = eventSlug.replace(/\s+/g, '').toLowerCase();
    const cleanYear = yearSlug.toLowerCase();
    navigate(`/generator/${cleanEvent}/${cleanYear}`);
  }

  function handleEventSelect(newEventName) {
    setSelectedDifficulty('All');
    // Default to 'all' years when switching to a brand new event ecosystem
    updateParamRouting(newEventName, 'all');
  }

  function handleYearSelect(newYearValue) {
    setSelectedDifficulty('All');
    if (selectedEvent) {
      updateParamRouting(selectedEvent, newYearValue);
    }
  }

  /* =========================
     YEAR OPTIONS (EVENT-AWARE)
     ========================= */
  const years = useMemo(() => {
    if (!selectedEvent) return ['All'];
    const base = selectedEvent === 'All' ? tricks : indexed.get(selectedEvent) || [];
    const set = new Set(base.map(e => e.year));
    return ['All', ...Array.from(set)].sort((a, b) => (a === 'All' ? -1 : b - a));
  }, [selectedEvent, indexed]);

  /* =========================
     DIFFICULTY OPTIONS
     ========================= */
  const difficulties = useMemo(() => {
    if (!selectedEvent) return ['All'];
    const base = selectedEvent === 'All' ? tricks : indexed.get(selectedEvent) || [];
    const filtered = selectedYear === 'All' ? base : base.filter(e => e.year === Number(selectedYear));
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

    let base = selectedEvent === 'All' ? tricks : indexed.get(selectedEvent) || [];

    if (selectedYear !== 'All') {
      base = base.filter(e => e.year === Number(selectedYear));
    }

    const filtered = [];
    for (const entry of base) {
      for (const [difficulty, list] of Object.entries(entry.tricks)) {
        const difficultyOk = selectedDifficulty === 'All' || difficulty === selectedDifficulty;
        if (!difficultyOk) continue;
        filtered.push(...list);
      }
    }
    setAvailableTricks(filtered);
  }, [selectedEvent, selectedYear, selectedDifficulty, indexed]);

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
     🎨 DYNAMIC THEME SYSTEM CONFIGURATION
     ========================================================================= */
  const vanJamYellow = '#eec14d';
  const vanJamGreen = '#b5ca6d'; 
  const vanJamDarkText = '#1a1a1a';

  const activeThemeColor = is2026 ? vanJamGreen : vanJamYellow;
  const activeBorderColor = is2026 ? '#9cb057' : '#dfb13c';

  const vanJamButtonStyles = isVanJam ? {
    backgroundColor: activeThemeColor, 
    color: vanJamDarkText,            
    border: `1px solid ${activeBorderColor}`,
    fontWeight: '600'
  } : {};

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
     VIEW 2: WORKBENCH COMPONENT
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
            onChange={e => handleYearSelect(e.target.value)}
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
        <button 
          onClick={generateTrick} 
          disabled={!availableTricks.length}
          style={vanJamButtonStyles}
        >
          Generate Trick
        </button>

        <button 
          onClick={() => setIsModalOpen(true)} 
          disabled={!availableTricks.length}
          style={vanJamButtonStyles}
        >
          View All Tricks ({availableTricks.length})
        </button>

        <button
          onClick={() => setGeneratedTricks([])}
          disabled={!generatedTricks.length}
          style={{
            ...vanJamButtonStyles,
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
            <li 
              key={`${trick}-${index}`} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '0.5rem', 
                borderBottom: '1px solid var(--color-border)' 
              }}
            >
              <span>{trick}</span>
              <div style={{ display: 'flex', gap: '1rem' }}>
                
                <span 
                  onClick={() => completeTrick(trick, index)} 
                  style={{ 
                    color: isVanJam ? activeThemeColor : 'var(--color-text-primary)',
                    cursor: 'pointer', 
                    fontSize: '1.2rem',
                    userSelect: 'none',
                    padding: '0 0.2rem'
                  }} 
                  title="Mark as completed"
                >
                  ✓
                </span>
                
                <span 
                  onClick={() => removeTrick(index)} 
                  style={{ 
                    color: isVanJam ? activeThemeColor : 'var(--color-text-primary)',
                    cursor: 'pointer', 
                    fontSize: '1.2rem', 
                    opacity: 0.7,
                    userSelect: 'none',
                    padding: '0 0.2rem'
                  }} 
                  title="Remove from list"
                >
                  ×
                </span>

              </div>
            </li>
          ))}
        </ul>
      )}

      {/* POPUP MODAL */}
      {isModalOpen && createPortal(
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Active Trick Pool ({availableTricks.length})</div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-meta">Filters: {selectedEvent} • Year: {selectedYear} • Diff: {selectedDifficulty}</div>
              <ul className="modal-list">
                {availableTricks.map((trick, idx) => (
                  <li key={`${trick}-${idx}`} className="modal-item">{idx + 1}. {trick}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}