import { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router';
import tricks from '../../data/structured_tricks.json';

export default function Generator({ onLogTrick, generatedTricks = [], setGeneratedTricks }) {
  const { event, year } = useParams();
  const navigate = useNavigate();

  // Timer intervals and accurate clock references
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

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

  const selectedYear = useMemo(() => {
    if (!year) return 'All';
    if (year.toLowerCase() === 'all') return 'All';
    return year;
  }, [year]);

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
     ⏱️ TIMER MODE STATES
     ========================================================================= */
  const [isTimerMode, setIsTimerMode] = useState(false);
  const [timerScope, setTimerScope] = useState('6'); // '6' or 'all'
  const [timerStatus, setTimerStatus] = useState('config'); // 'config' | 'countdown' | 'running' | 'results'
  const [timerTricks, setTimerTricks] = useState([]);
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

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
     ⚙️ DYNAMIC PARAM NAVIGATION HANDLERS (Preserve Timer State)
     ========================================================================= */
  function updateParamRouting(eventSlug, yearSlug) {
    const cleanEvent = eventSlug.replace(/\s+/g, '').toLowerCase();
    const cleanYear = yearSlug.toLowerCase();
    navigate(`/generator/${cleanEvent}/${cleanYear}`);
  }

  function handleEventSelect(newEventName) {
    setSelectedDifficulty('All');
    updateParamRouting(newEventName, 'all');
    // If running a speedrun track, abort back to config on structural location swaps
    if (timerStatus === 'countdown' || timerStatus === 'running') {
      softResetTimerSession();
    }
  }

  function handleYearSelect(newYearValue) {
    setSelectedDifficulty('All');
    if (selectedEvent) {
      updateParamRouting(selectedEvent, newYearValue);
    }
    if (timerStatus === 'countdown' || timerStatus === 'running') {
      softResetTimerSession();
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

  /* =========================================================================
     🛡️ FILTERED TRICK POOL (WITH ABSOLUTE DEDUPLICATION PROOFING)
     ========================================================================= */
  useEffect(() => {
    if (!selectedEvent) return;

    let base = selectedEvent === 'All' ? tricks : indexed.get(selectedEvent) || [];

    if (selectedYear !== 'All') {
      base = base.filter(e => e.year === Number(selectedYear));
    }

    const rawSetCollector = new Set();
    for (const entry of base) {
      for (const [difficulty, list] of Object.entries(entry.tricks)) {
        const difficultyOk = selectedDifficulty === 'All' || difficulty === selectedDifficulty;
        if (!difficultyOk) continue;
        
        list.forEach(trickItem => rawSetCollector.add(trickItem));
      }
    }
    
    setAvailableTricks(Array.from(rawSetCollector));
  }, [selectedEvent, selectedYear, selectedDifficulty, indexed]);

  /* =========================================================================
     🎲 UNIQUE TRICK GENERATOR LOGIC
     ========================================================================= */
  function generateTrick() {
    const uniqueAvailable = availableTricks.filter(
      trick => !generatedTricks.includes(trick)
    );

    if (!uniqueAvailable.length) {
      alert("All available unique tricks for these filters are already in the queue!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * uniqueAvailable.length);
    const newTrick = uniqueAvailable[randomIndex];
    setGeneratedTricks(prev => [newTrick, ...prev]);
  }

  function generateSixTricks() {
    let uniqueAvailable = availableTricks.filter(
      trick => !generatedTricks.includes(trick)
    );

    if (!uniqueAvailable.length) {
      alert("All available unique tricks for these filters are already in the queue!");
      return;
    }

    const newBatch = [];
    const count = Math.min(6, uniqueAvailable.length);

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * uniqueAvailable.length);
      const chosenTrick = uniqueAvailable[randomIndex];
      
      newBatch.push(chosenTrick);
      uniqueAvailable = uniqueAvailable.filter(t => t !== chosenTrick);
    }

    setGeneratedTricks(prev => [...newBatch, ...prev]);
  }

  function removeTrick(index) {
    setGeneratedTricks(prev => prev.filter((_, i) => i !== index));
  }

  function completeTrick(trickName, index) {
    if (onLogTrick) onLogTrick(trickName);
    removeTrick(index);
  }

  /* =========================================================================
     ⏱️ SPEEDRUN TIMER RUNTIME CONTROLLERS
     ========================================================================= */
  function resetTimerMode() {
    setIsTimerMode(false);
    softResetTimerSession();
  }

  function softResetTimerSession() {
    setTimerStatus('config');
    setTimerTricks([]);
    setCurrentTimerIndex(0);
    setTimeElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function initTimerSession() {
    if (!availableTricks.length) return;

    let pool = [...availableTricks];
    let selectedSelection = [];

    // Fisher-Yates Shuffle Algorithm to ensure randomization
    const shuffle = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    if (timerScope === '6') {
      // Pick 6 random tricks
      const count = Math.min(6, pool.length);
      for (let i = 0; i < count; i++) {
        const randIdx = Math.floor(Math.random() * pool.length);
        selectedSelection.push(pool[randIdx]);
        pool.splice(randIdx, 1);
      }
    } else {
      // Take all tricks and shuffle them
      selectedSelection = shuffle(pool);
    }

    setTimerTricks(selectedSelection);
    setCurrentTimerIndex(0);
    setTimeElapsed(0);
    setTimerStatus('countdown');
  }

  function startActualTimer() {
    setTimerStatus('running');
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeElapsed(Date.now() - startTimeRef.current);
    }, 10);
  }

  function handleTimerTap() {
    if (timerStatus === 'countdown') {
      startActualTimer();
      return;
    }

    if (timerStatus === 'running') {
      if (currentTimerIndex < timerTricks.length - 1) {
        setCurrentTimerIndex(prev => prev + 1);
      } else {
        clearInterval(timerRef.current);
        setTimerStatus('results');

        const rawDurationSecs = (timeElapsed / 1000).toFixed(2);
        const formatLogText = `⏱️ Speedrun [${selectedEvent} - ${selectedYear} - ${selectedDifficulty}]: Finished ${timerTricks.length} tricks in ${rawDurationSecs}s`;
        
        if (onLogTrick) onLogTrick(formatLogText);
      }
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* =========================================================================
     ⌨️ KEYBOARD SUPPORT (SPACEBAR TRIGGER)
     ========================================================================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger if we are currently in an active timer state
      if ((timerStatus === 'countdown' || timerStatus === 'running') && e.code === 'Space') {
        e.preventDefault(); // Stop the spacebar from scrolling the page
        handleTimerTap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timerStatus, currentTimerIndex, timerTricks]); // Re-bind when state changes

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Link 
          to="/generator" 
          onClick={resetTimerMode}
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

        {/* MODE TOGGLE LINK */}
        <button
          onClick={() => {
            if (isTimerMode) {
              resetTimerMode();
            } else {
              setIsTimerMode(true);
              softResetTimerSession();
            }
          }}
          style={{
            background: 'transparent',
            border: `1px solid ${isTimerMode ? 'var(--color-primary)' : 'var(--color-border)'}`,
            color: isTimerMode ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          {isTimerMode ? '🔄 Normal Mode' : '⏱️ Try Timer Mode'}
        </button>
      </div>

      <h2>{selectedEvent === 'All' ? 'All Events' : selectedEvent}</h2>
      
      {/* FILTER CONTROLS SUBROW */}
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

      {/* =========================================================================
         🎰 RENDERING BLOCK A: TIMER MODE SUBPANEL
         ========================================================================= */}
      {isTimerMode && (
        <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--color-border)' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            ⏱️ Speedrun Configurator
          </h3>
          
          {timerStatus === 'config' && (
            <>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Select whether you want to race through a standard set of 6 random tricks or clear the entire trick list.
              </p>
              
              {/* NEW SEGMENTED CHIP TOGGLE CONTROL CONTAINER */}
              <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Target Size:</span>
                <div style={{ 
                  display: 'inline-flex', 
                  background: 'rgba(255, 255, 255, 0.06)', 
                  padding: '2px', 
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)' 
                }}>
                  <button
                    type="button"
                    onClick={() => setTimerScope('6')}
                    style={{
                      background: timerScope === '6' ? (isVanJam ? activeThemeColor : 'var(--color-primary)') : 'transparent',
                      color: timerScope === '6' ? (isVanJam ? vanJamDarkText : '#fff') : 'var(--color-text-secondary)',
                      border: 'none',
                      padding: '0.4rem 1rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    6 Tricks
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimerScope('all')}
                    style={{
                      background: timerScope === 'all' ? (isVanJam ? activeThemeColor : 'var(--color-primary)') : 'transparent',
                      color: timerScope === 'all' ? (isVanJam ? vanJamDarkText : '#fff') : 'var(--color-text-secondary)',
                      border: 'none',
                      padding: '0.4rem 1rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    All Tricks ({availableTricks.length})
                  </button>
                </div>
              </div>

              <button
                onClick={initTimerSession}
                disabled={!availableTricks.length}
                style={{
                  ...vanJamButtonStyles,
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  marginTop: '0.5rem'
                }}
              >
                Launch Speedrun Track
              </button>
            </>
          )}

          {timerStatus === 'results' && (
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <h4 style={{ color: 'var(--color-success)', fontSize: '1.3rem', margin: '0 0 0.5rem 0' }}>🎉 Set Complete!</h4>
              <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                Cleared <strong>{timerTricks.length}</strong> tricks in:
              </p>
              <div style={{ fontSize: '2.2rem', fontWeight: '700', fontFamily: 'monospace', margin: '0.5rem 0', color: isVanJam ? activeThemeColor : 'var(--color-primary)' }}>
                {formatTime(timeElapsed)}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                Record logged.
              </p>
              <button onClick={() => setTimerStatus('config')} style={{ padding: '0.5rem 1rem' }}>
                Run Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
         🎲 RENDERING BLOCK B: STANDARD QUEUE WORKBENCH
         ========================================================================= */}
      {!isTimerMode && (
        <>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={generateTrick} disabled={!availableTricks.length} style={vanJamButtonStyles}>
              Generate Trick
            </button>
            <button onClick={generateSixTricks} disabled={!availableTricks.length} style={vanJamButtonStyles}>
              Generate 6 Tricks
            </button>
            <button onClick={() => setIsModalOpen(true)} disabled={!availableTricks.length} style={vanJamButtonStyles}>
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

          <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Available tricks: <strong style={{ color: 'var(--color-text-primary)' }}>{availableTricks.length}</strong> 
            &nbsp;•&nbsp; 
            Queue: <strong style={{ color: isVanJam ? activeThemeColor : 'var(--color-text-primary)' }}>{generatedTricks.length}</strong>
          </p>

          {/* GENERATED LIST ENGINE */}
          {generatedTricks.length > 0 && (
            <ul style={{ marginTop: '1rem', padding: 0, listStyle: 'none' }}>
              {generatedTricks.map((trick, index) => (
                <li key={`${trick}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                  <span>{trick}</span>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span onClick={() => completeTrick(trick, index)} style={{ color: isVanJam ? activeThemeColor : 'var(--color-text-primary)', cursor: 'pointer', fontSize: '1.2rem', userSelect: 'none' }} title="Mark as completed">✓</span>
                    <span onClick={() => removeTrick(index)} style={{ color: isVanJam ? activeThemeColor : 'var(--color-text-primary)', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.7, userSelect: 'none' }} title="Remove from list">×</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* POPUP MODAL COMPONENT PORTAL */}
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
            <div className="modal-footer">
              <button onClick={() => setIsModalOpen(false)} style={vanJamButtonStyles}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
         💥 FULLSCREEN OPAQUE TIMING SCREEN INTERCEPTOR
         ========================================================================= */}
      {(timerStatus === 'countdown' || timerStatus === 'running') && createPortal(
        <div 
          onClick={handleTimerTap}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            backgroundColor: 'rgba(10, 18, 30, 0.96)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '2rem 1.5rem',
            boxSizing: 'border-box',
            textAlign: 'center',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          {/* HEADER ROW BAR */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🏁 Speedrun Track &mdash; {selectedDifficulty}
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation(); 
                softResetTimerSession();
              }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Abort Run
            </button>
          </div>

          {/* MAIN TRICK CORE CONTAINER CARD */}
          <div style={{ maxWidth: '800px' }}>
            {timerStatus === 'countdown' ? (
              <div>
                <h1 style={{ fontSize: '3.5rem', margin: '0 0 1rem 0', color: isVanJam ? activeThemeColor : 'var(--color-primary)' }}>READY</h1>
                <p style={{ fontSize: '1.4rem', opacity: 0.8 }}>
                  Tap anywhere on the screen or press [SPACE] to start the clock!
                </p>
                <div style={{ marginTop: '2rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)' }}>
                  Total tricks scheduled: {timerTricks.length}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
                  TRICK {currentTimerIndex + 1} OF {timerTricks.length}
                </div>
                <h1 style={{ fontSize: '3.8rem', fontWeight: '800', margin: '0 0 2rem 0', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
                  {timerTricks[currentTimerIndex]}
                </h1>
                <p style={{ fontSize: '1.1rem', color: isVanJam ? activeThemeColor : 'rgba(255,255,255,0.6)' }}>
                  {currentTimerIndex === timerTricks.length - 1 
                    ? '👉 TAP OR [SPACE] TO FINISH RUN' 
                    : '👉 TAP OR [SPACE] FOR THE NEXT TRICK'}
                </p>
              </div>
            )}
          </div>

          {/* REALTIME COUNTER TIMER FOOTER */}
          <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '3.5rem', fontWeight: '700' }}>
              {formatTime(timeElapsed)}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
              Centisecond Live System Metrics
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}