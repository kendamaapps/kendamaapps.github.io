import { useEffect, useMemo, useState } from 'react';
import tricks from '../../data/tricks.json';

export default function Generator() {
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const [availableTricks, setAvailableTricks] = useState([]);
  const [generatedTricks, setGeneratedTricks] = useState([]);

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
    setGeneratedTricks([]);
  }, [selectedEvent, selectedYear, selectedDifficulty, indexed]);

  /* =========================
     ACTIONS
     ========================= */
  function generateTrick() {
    if (!availableTricks.length) return;

    const randomIndex = Math.floor(Math.random() * availableTricks.length);
    const newTrick = availableTricks[randomIndex];

    setGeneratedTricks(prev => [newTrick, ...prev]);
  }

  function removeTrick(index) {
    setGeneratedTricks(prev =>
      prev.filter((_, i) => i !== index)
    );
  }

  /* =========================
     UI
     ========================= */
  return (
    <div className="card">
      <h2>Trick Generator</h2>

      <p>Generate random kendama tricks using filters.</p>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label>Event</label>
          <br />
          <select
            value={selectedEvent}
            onChange={e => {
              setSelectedEvent(e.target.value);
              setSelectedYear('All');
              setSelectedDifficulty('All');
            }}
          >
            {events.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

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

      {/* BUTTON */}
      <div style={{ marginTop: '1.2rem' }}>
        <button
          onClick={generateTrick}
          disabled={!availableTricks.length}
        >
          Generate Trick
        </button>
      </div>

      <p style={{ marginTop: '1rem' }}>
        Available tricks: {availableTricks.length}
      </p>

      {/* GENERATED LIST */}
      {generatedTricks.length > 0 && (
        <ul style={{ marginTop: '1rem' }}>
          {generatedTricks.map((trick, index) => (
            <li
              key={`${trick}-${index}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{trick}</span>

              <button
                onClick={() => removeTrick(index)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}