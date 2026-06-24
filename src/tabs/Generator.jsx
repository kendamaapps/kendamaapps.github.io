import { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router';
import tricks from '../../data/structured_tricks.json';

/* =========================================================================
   🎲 DETERMINISTIC SEEDED PRNG ENGINE (SFC32 + MurmurHash3)
   ========================================================================= */
function createSeededRandom(seedString) {
  // Hash the seed string into four 32-bit integers
  let h = 1779033703 ^ seedString.length;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  
  const defineState = () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };

  let a = defineState();
  let b = defineState();
  let c = defineState();
  let d = defineState();

  // Return SFC32 random function (returns 0.0 to 1.0 predictably)
  return function () {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

export default function Generator({ onLogTrick, generatedTricks = [], setGeneratedTricks }) {
  const { event, year } = useParams();
  const navigate = useNavigate();

  // 📝 PASTE YOUR GOOGLE DEPLOYMENT WEB APP URL HERE:
  const GOOGLE_SCRIPT_URL = import.meta.env ? import.meta.env.VITE_GOOGLE_SCRIPT_URL : process.env.REACT_APP_GOOGLE_SCRIPT_URL;

  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'success' | 'error'

  async function submitToGoogleSheets() {
    if (!displayName.trim()) {
      alert("Please enter a display name to log your speedrun!");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const payload = {
      displayName: displayName.trim(),
      event: selectedEvent,
      year: selectedYear,
      difficulty: selectedDifficulty,
      seed: speedrunSeed,
      numTricks: timerTricks.length,
      completionTime: (timeElapsed / 1000).toFixed(2) // Standardized to precise seconds (e.g., "42.53")
    };

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      setSubmitStatus('success');
    } catch (error) {
      console.error("Leaderboard transmission error:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }

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
    const priority = {
      'Van Jam': 1,
      'Kendama World Cup': 2,
      'Taiwan Kendama Open': 3
    };

    const sortedKeys = Array.from(indexed.keys()).sort((a, b) => {
      const priorityA = priority[a] || 99;
      const priorityB = priority[b] || 99;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.localeCompare(b);
    });

    return ['All', ...sortedKeys];
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
  
  // Custom seed states
  const [speedrunSeed, setSpeedrunSeed] = useState('');

  // Automatically roll a fresh random 6-digit seed when entering config mode
  useEffect(() => {
    if (timerStatus === 'config' && !speedrunSeed) {
      generateNewSeed();
    }
  }, [timerStatus]);

  function generateNewSeed() {
    const freshSeed = Math.floor(100000 + Math.random() * 900000).toString();
    setSpeedrunSeed(freshSeed);
  }

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

  /* =========================================================================
      DIFFICULTY OPTIONS (6 Difficulties Total via Custom Compound Tiers)
     ========================================================================= */
  const difficulties = useMemo(() => {
    if (!selectedEvent) return ['All'];
    const base = selectedEvent === 'All' ? tricks : indexed.get(selectedEvent) || [];
    const filtered = selectedYear === 'All' ? base : base.filter(e => e.year === Number(selectedYear));
    const set = new Set();
    for (const entry of filtered) {
      Object.keys(entry.tricks).forEach(d => set.add(d));
    }
    
    const coreDifficulties = Array.from(set);
    
    // Inject the combined 30-trick sets ONLY for Van Jam
    if (selectedEvent === 'Van Jam' && (coreDifficulties.includes('Casual') || coreDifficulties.includes('Competitive'))) {
      return ['All', ...coreDifficulties, '30 Tricks (Casual)', '30 Tricks (Competitive)'];
    }
    
    return ['All', ...coreDifficulties];
  }, [selectedEvent, selectedYear, indexed]);

  /* =========================================================================
      🛡️ FILTERED TRICK POOL (WITH COMPOUND DIFFICULTIES INTEGRATION)
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
        let isMatch = false;

        if (selectedDifficulty === 'All') {
          isMatch = true;
        } else if (selectedDifficulty === '30 Tricks (Casual)') {
          isMatch = difficulty === 'Casual' || difficulty === 'Casual Top 16';
        } else if (selectedDifficulty === '30 Tricks (Competitive)') {
          isMatch = difficulty === 'Competitive' || difficulty === 'Competitive Top 16';
        } else {
          isMatch = difficulty === selectedDifficulty;
        }

        if (isMatch) {
          list.forEach(trickItem => rawSetCollector.add(trickItem));
        }
      }
    }
    
    setAvailableTricks(Array.from(rawSetCollector).sort());
  }, [selectedEvent, selectedYear, selectedDifficulty, indexed]);

  /* =========================================================================
      🎲 UNIQUE TRICK GENERATOR LOGIC (Standard Mode keeps native Math.random)
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
      ⏱️ SPEEDRUN TIMER RUNTIME CONTROLLERS (Seeded & Deterministic)
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
    setSpeedrunSeed('');
    setSubmitStatus(null); 
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function initTimerSession() {
    if (!availableTricks.length) return;

    let finalSeed = speedrunSeed.trim();
    if (!finalSeed) {
      finalSeed = Math.floor(100000 + Math.random() * 900000).toString();
      setSpeedrunSeed(finalSeed);
    }

    const rng = createSeededRandom(finalSeed);
    let pool = [...availableTricks];
    let selectedSelection = [];

    const seededShuffle = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    if (timerScope === '6') {
      const count = Math.min(6, pool.length);
      for (let i = 0; i < count; i++) {
        const randIdx = Math.floor(rng() * pool.length);
        selectedSelection.push(pool[randIdx]);
        pool.splice(randIdx, 1);
      }
    } else {
      selectedSelection = seededShuffle(pool);
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
        const formatLogText = `⏱️ Speedrun [${selectedEvent} - ${selectedYear} - ${selectedDifficulty}] (Seed: ${speedrunSeed}): Finished ${timerTricks.length} tricks in ${rawDurationSecs}s`;
        
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
      if ((timerStatus === 'countdown' || timerStatus === 'running') && e.code === 'Space') {
        e.preventDefault(); 
        handleTimerTap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timerStatus, currentTimerIndex, timerTricks]);

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
          &larr; Back to Events
        </Link>

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
              
              <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
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

              <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                <label style={{ fontSize: '0.85rem', display: 'block', color: 'var(--color-text-secondary)', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Competition Track Seed (6 Digits)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={speedrunSeed}
                    onChange={(e) => setSpeedrunSeed(e.target.value.replace(/\D/g, ''))} 
                    placeholder="Random"
                    style={{ 
                      flex: 1, 
                      padding: '0.4rem 0.6rem', 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid var(--color-border)', 
                      borderRadius: '4px', 
                      color: '#fff',
                      fontFamily: 'monospace',
                      fontSize: '1rem',
                      letterSpacing: '2px',
                      textAlign: 'center'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={generateNewSeed}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: '4px' }}
                  >
                    🎲 Reroll
                  </button>
                </div>
                <small style={{ display: 'block', marginTop: '0.4rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                  Share this code with others to race head-to-head on the exact same randomized tricks!
                </small>
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
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
                Track Seed: <strong style={{ fontFamily: 'monospace' }}>{speedrunSeed}</strong>
              </p>

              <div style={{ 
                background: 'rgba(0,0,0,0.2)', 
                padding: '1rem', 
                borderRadius: '6px', 
                border: '1px solid var(--color-border)',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Submit Score to Leaderboard
                </label>
                
                {submitStatus !== 'success' ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <input 
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name/handle"
                      disabled={isSubmitting}
                      style={{ 
                        padding: '0.5rem', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid var(--color-border)', 
                        borderRadius: '4px', 
                        color: '#fff',
                        fontSize: '0.95rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={submitToGoogleSheets}
                      disabled={isSubmitting || !displayName.trim()}
                      style={{
                        ...vanJamButtonStyles,
                        padding: '0.5rem',
                        cursor: (isSubmitting || !displayName.trim()) ? 'not-allowed' : 'pointer',
                        opacity: (isSubmitting || !displayName.trim()) ? 0.6 : 1,
                        fontSize: '0.9rem'
                      }}
                    >
                      {isSubmitting ? '⌛ Uploading...' : '🚀 Submit Score'}
                    </button>
                    {submitStatus === 'error' && (
                      <small style={{ color: 'var(--color-error)', marginTop: '0.25rem' }}>
                        &times; Error uploading score. Please try again.
                      </small>
                    )}
                  </div>
                ) : (
                  <div style={{ color: 'var(--color-success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0' }}>
                    &check; Score safely logged directly to Google Sheets!
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  setSpeedrunSeed('');   
                  setDisplayName('');    
                  setSubmitStatus(null); 
                  setTimerStatus('config');
                }} 
                style={{ padding: '0.5rem 1rem', width: '100%' }}
              >
                &#x21bb; Run Again (New Seed)
              </button>
            </div>
          )}
        </div>
      )}

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
            &nbsp;&bull;&nbsp; 
            Queue: <strong style={{ color: isVanJam ? activeThemeColor : 'var(--color-text-primary)' }}>{generatedTricks.length}</strong>
          </p>
        </>
      )}
    </div>
  );
}