import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import tricks from '../../../data/structured_tricks.json';

import { isVanJam, resolvePool, resolveVanJamDifficulties } from './lib/vanJam';
import { randomSixDigitSeed } from './lib/prng';
import { useTimer } from './hooks/useTimer';

import EventHub             from './components/EventHub';
import TrickQueue           from './components/TrickQueue';
import TrickPoolModal       from './components/TrickPoolModal';
import SpeedrunConfigurator from './components/SpeedrunConfigurator';
import SpeedrunResults      from './components/SpeedrunResults';
import TimerOverlay         from './components/TimerOverlay';

/* -------------------------------------------------------------------------
   Constants
   ------------------------------------------------------------------------- */
const GOOGLE_SCRIPT_URL = import.meta.env
  ? import.meta.env.VITE_GOOGLE_SCRIPT_URL
  : process.env.REACT_APP_GOOGLE_SCRIPT_URL;

const EVENT_PRIORITY = { 'Van Jam': 1, 'Kendama World Cup': 2, 'Taiwan Kendama Open': 3 };

// Van Jam theme tokens
const VJ_YELLOW      = '#eec14d';
const VJ_GREEN       = '#b5ca6d';
const VJ_DARK_TEXT   = '#1a1a1a';
const VJ_BORDER_Y    = '#dfb13c';
const VJ_BORDER_G    = '#9cb057';

/* =========================================================================
   Generator
   ========================================================================= */
export default function Generator({ onLogTrick, generatedTricks = [], setGeneratedTricks }) {
  const { event, year } = useParams();
  const navigate = useNavigate();

  /* -----------------------------------------------------------------------
     Data index
     ----------------------------------------------------------------------- */
  const indexed = useMemo(() => {
    const map = new Map();
    for (const entry of tricks) {
      if (!map.has(entry.event)) map.set(entry.event, []);
      map.get(entry.event).push(entry);
    }
    return map;
  }, []);

  const events = useMemo(() => {
    const sorted = Array.from(indexed.keys()).sort((a, b) => {
      const pa = EVENT_PRIORITY[a] || 99, pb = EVENT_PRIORITY[b] || 99;
      return pa !== pb ? pa - pb : a.localeCompare(b);
    });
    return ['All', ...sorted];
  }, [indexed]);

  /* -----------------------------------------------------------------------
     Route params → selection
     ----------------------------------------------------------------------- */
  const selectedEvent = useMemo(() => {
    if (!event) return null;
    if (event.toLowerCase() === 'all') return 'All';
    return events.find(e => e.replace(/\s+/g, '').toLowerCase() === event.toLowerCase());
  }, [event, events]);

  const selectedYear = useMemo(() => {
    if (!year || year.toLowerCase() === 'all') return 'All';
    return year;
  }, [year]);

  useEffect(() => {
    if (event && !selectedEvent) navigate('/generator', { replace: true });
  }, [event, selectedEvent, navigate]);

  /* -----------------------------------------------------------------------
     Filter state
     ----------------------------------------------------------------------- */
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [isModalOpen, setIsModalOpen]               = useState(false);
  const [isTimerMode, setIsTimerMode]               = useState(false);

  /* -----------------------------------------------------------------------
     Van Jam theme
     ----------------------------------------------------------------------- */
  const vjEvent = isVanJam(selectedEvent);
  const is2026  = selectedYear === '2026' || selectedYear === 'All';
  const accentColor      = vjEvent ? (is2026 ? VJ_GREEN  : VJ_YELLOW)   : null;
  const accentBorderColor = vjEvent ? (is2026 ? VJ_BORDER_G : VJ_BORDER_Y) : null;
  const vjButtonStyles   = vjEvent
    ? { backgroundColor: accentColor, color: VJ_DARK_TEXT, border: `1px solid ${accentBorderColor}`, fontWeight: '600' }
    : {};

  useEffect(() => {
    if (vjEvent) document.body.setAttribute('data-theme', is2026 ? 'vanjam-2026' : 'vanjam-2025');
    else         document.body.removeAttribute('data-theme');
    return () => document.body.removeAttribute('data-theme');
  }, [vjEvent, is2026]);

  /* -----------------------------------------------------------------------
     Derived filter options
     ----------------------------------------------------------------------- */
  const years = useMemo(() => {
    if (!selectedEvent) return ['All'];
    const base = selectedEvent === 'All' ? tricks : indexed.get(selectedEvent) || [];
    const set = new Set(base.map(e => e.year));
    return ['All', ...Array.from(set)].sort((a, b) => a === 'All' ? -1 : b - a);
  }, [selectedEvent, indexed]);

  const difficulties = useMemo(() => {
    if (!selectedEvent) return ['All'];
    const base = selectedEvent === 'All' ? tricks : indexed.get(selectedEvent) || [];
    const filtered = selectedYear === 'All' ? base : base.filter(e => e.year === Number(selectedYear));

    if (isVanJam(selectedEvent)) return resolveVanJamDifficulties(filtered);

    const set = new Set(filtered.flatMap(e => Object.keys(e.tricks)));
    return ['All', ...Array.from(set)];
  }, [selectedEvent, selectedYear, indexed]);

  const availableTricks = useMemo(() => {
    if (!selectedEvent) return [];
    let base = selectedEvent === 'All' ? tricks : indexed.get(selectedEvent) || [];
    if (selectedYear !== 'All') base = base.filter(e => e.year === Number(selectedYear));
    return resolvePool(base, selectedDifficulty, selectedEvent);
  }, [selectedEvent, selectedYear, selectedDifficulty, indexed]);

  /* -----------------------------------------------------------------------
     Navigation helpers (reset difficulty on change)
     ----------------------------------------------------------------------- */
  function navigate2(eventSlug, yearSlug) {
    navigate(`/generator/${eventSlug.replace(/\s+/g, '').toLowerCase()}/${yearSlug.toLowerCase()}`);
  }

  function handleEventSelect(name) {
    setSelectedDifficulty('All');
    navigate2(name, 'all');
    timer.reset();
  }

  function handleYearSelect(yr) {
    setSelectedDifficulty('All');
    if (selectedEvent) navigate2(selectedEvent, yr);
    timer.reset();
  }

  /* -----------------------------------------------------------------------
     Queue logic
     ----------------------------------------------------------------------- */
  function getUniquePool() {
    return availableTricks.filter(t => !generatedTricks.includes(t));
  }

  function generateTrick() {
    const pool = getUniquePool();
    if (!pool.length) { alert("All available unique tricks for these filters are already in the queue!"); return; }
    setGeneratedTricks(prev => [pool[Math.floor(Math.random() * pool.length)], ...prev]);
  }

  function generateSixTricks() {
    let pool = getUniquePool();
    if (!pool.length) { alert("All available unique tricks for these filters are already in the queue!"); return; }
    const batch = [];
    for (let i = 0; i < Math.min(6, pool.length); i++) {
      const idx = Math.floor(Math.random() * pool.length);
      batch.push(pool[idx]);
      pool = pool.filter((_, j) => j !== idx);
    }
    setGeneratedTricks(prev => [...batch, ...prev]);
  }

  function removeTrick(index) {
    setGeneratedTricks(prev => prev.filter((_, i) => i !== index));
  }

  function completeTrick(trickName, index) {
    onLogTrick?.(trickName);
    removeTrick(index);
  }

  /* -----------------------------------------------------------------------
     Timer
     ----------------------------------------------------------------------- */
  const timer = useTimer({
    availableTricks,
    onComplete: () => {
      const log = `⏱️ Speedrun [${selectedEvent} - ${selectedYear} - ${selectedDifficulty}] (Seed: ${timer.seed}): Finished ${timer.tricks.length} tricks in ${(timer.elapsed / 1000).toFixed(2)}s`;
      onLogTrick?.(log);
    },
  });

  /* -----------------------------------------------------------------------
     Leaderboard submit
     ----------------------------------------------------------------------- */
  const [displayName, setDisplayName]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  async function submitToGoogleSheets() {
    if (!displayName.trim()) { alert("Please enter a display name to log your speedrun!"); return; }
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          event: selectedEvent, year: selectedYear, difficulty: selectedDifficulty,
          seed: timer.seed, numTricks: timer.tricks.length,
          completionTime: (timer.elapsed / 1000).toFixed(2),
        }),
      });
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  /* -----------------------------------------------------------------------
     View 1: event hub
     ----------------------------------------------------------------------- */
  if (!selectedEvent) {
    return <EventHub events={events} onSelect={handleEventSelect} />;
  }

  /* -----------------------------------------------------------------------
     View 2: workbench
     ----------------------------------------------------------------------- */
  const timerActive = timer.status === 'countdown' || timer.status === 'running';

  return (
    <div className="card">
      {/* Top nav row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Link
          to="/generator"
          onClick={() => { setIsTimerMode(false); timer.reset(); }}
          style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
        >
          ← Back to Events
        </Link>
        <button
          onClick={() => { isTimerMode ? (setIsTimerMode(false), timer.reset()) : (setIsTimerMode(true), timer.reset()); }}
          style={{
            background: 'transparent',
            border: `1px solid ${isTimerMode ? 'var(--color-primary)' : 'var(--color-border)'}`,
            color: isTimerMode ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer',
          }}
        >
          {isTimerMode ? '🔄 Normal Mode' : '⏱️ Try Timer Mode'}
        </button>
      </div>

      <h2>{selectedEvent === 'All' ? 'All Events' : selectedEvent}</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <div>
          <label>Year</label><br />
          <select value={selectedYear} onChange={e => handleYearSelect(e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label>Difficulty</label><br />
          <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)}>
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Timer panel */}
      {isTimerMode && (
        <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--color-border)' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            ⏱️ Speedrun Configurator
          </h3>

          {timer.status === 'config' && (
            <SpeedrunConfigurator
              scope={timer.scope}
              seed={timer.seed}
              availableCount={availableTricks.length}
              accentColor={accentColor}
              accentTextColor={vjEvent ? VJ_DARK_TEXT : null}
              buttonStyles={vjButtonStyles}
              onScopeChange={timer.setScope}
              onSeedChange={timer.setSeed}
              onRerollSeed={() => timer.setSeed(randomSixDigitSeed())}
              onLaunch={timer.launch}
            />
          )}

          {timer.status === 'results' && (
            <SpeedrunResults
              elapsed={timer.elapsed}
              trickCount={timer.tricks.length}
              seed={timer.seed}
              accentColor={accentColor}
              buttonStyles={vjButtonStyles}
              displayName={displayName}
              isSubmitting={isSubmitting}
              submitStatus={submitStatus}
              onDisplayNameChange={setDisplayName}
              onSubmit={submitToGoogleSheets}
              onRunAgain={() => {
                timer.setSeed('');
                setDisplayName('');
                setSubmitStatus(null);
                timer.reset();
              }}
            />
          )}
        </div>
      )}

      {/* Queue workbench */}
      {!isTimerMode && (
        <TrickQueue
          availableTricks={availableTricks}
          generatedTricks={generatedTricks}
          accentColor={accentColor}
          onGenerate={generateTrick}
          onGenerateSix={generateSixTricks}
          onViewAll={() => setIsModalOpen(true)}
          onComplete={completeTrick}
          onRemove={removeTrick}
          onClear={() => setGeneratedTricks([])}
          buttonStyles={vjButtonStyles}
        />
      )}

      {/* Modals & overlays */}
      {isModalOpen && (
        <TrickPoolModal
          tricks={availableTricks}
          selectedEvent={selectedEvent}
          selectedYear={selectedYear}
          selectedDifficulty={selectedDifficulty}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {timerActive && (
        <TimerOverlay
          status={timer.status}
          tricks={timer.tricks}
          index={timer.index}
          elapsed={timer.elapsed}
          seed={timer.seed}
          difficulty={selectedDifficulty}
          accentColor={accentColor}
          onTap={timer.tap}
          onAbort={timer.reset}
        />
      )}
    </div>
  );
}
