import { useEffect, useMemo, useState } from 'react';
import tricks from '../../data/tricks.json';

export default function Generator() {
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const [availableTricks, setAvailableTricks] = useState([]);
  const [generatedTricks, setGeneratedTricks] = useState([]);

  /* =========================
     FILTER OPTIONS (CASCADED)
     ========================= */

  const events = useMemo(() => {
    return ['All', ...new Set(tricks.map(e => e.event))];
  }, []);

  const years = useMemo(() => {
    const filteredByEvent = tricks.filter(
      e => selectedEvent === 'All' || e.event === selectedEvent
    );

    return [
      'All',
      ...new Set(filteredByEvent.map(e => e.year))
    ].sort((a, b) => (a === 'All' ? -1 : b - a));
  }, [selectedEvent]);

  const difficulties = useMemo(() => {
    const filteredByEventYear = tricks.filter(e => {
      const eventMatch = selectedEvent === 'All' || e.event === selectedEvent;
      const yearMatch = selectedYear === 'All' || e.year === Number(selectedYear);
      return eventMatch && yearMatch;
    });

    const levels = new Set();

    filteredByEventYear.forEach(entry => {
      Object.keys(entry.tricks).forEach(level => levels.add(level));
    });

    return ['All', ...Array.from(levels)];
  }, [selectedEvent, selectedYear]);

  /* =========================
     FILTERED POOL
     ========================= */

  useEffect(() => {
    const filtered = [];

    tricks.forEach(entry => {
      const eventMatch =
        selectedEvent === 'All' || entry.event === selectedEvent;

      const yearMatch =
        selectedYear === 'All' || entry.year === Number(selectedYear);

      if (!eventMatch || !yearMatch) return;

      Object.entries(entry.tricks).forEach(([difficulty, list]) => {
        const difficultyMatch =
          selectedDifficulty === 'All' || difficulty === selectedDifficulty;

        if (!difficultyMatch) return;

        list.forEach(t => filtered.push(t));
      });
    });

    setAvailableTricks(filtered);
    setGeneratedTricks([]);
  }, [selectedEvent, selectedYear, selectedDifficulty]);

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
    setGeneratedTricks(prev => prev.filter((_, i) => i !== index));
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
          <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
            {events.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Year</label>
          <br />
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
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

      {/* spacing between filters and button */}
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