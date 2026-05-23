import { useEffect, useMemo, useState } from 'react';
import tricks from './tricks.json';

export default function Generator() {
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const [availableTricks, setAvailableTricks] = useState([]);
  const [generatedTricks, setGeneratedTricks] = useState([]);

  const events = useMemo(() => {
    return [
      'All',
      ...new Set(tricks.map((entry) => entry.event))
    ];
  }, []);

  const years = useMemo(() => {
    return [
      'All',
      ...new Set(tricks.map((entry) => entry.year))
    ].sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return b - a;
    });
  }, []);

  const difficulties = useMemo(() => {
    const levels = new Set();

    tricks.forEach((entry) => {
      Object.keys(entry.tricks).forEach((difficulty) => {
        levels.add(difficulty);
      });
    });

    return ['All', ...Array.from(levels)];
  }, []);

  useEffect(() => {
    const filtered = [];

    tricks.forEach((entry) => {
      const eventMatch =
        selectedEvent === 'All' ||
        entry.event === selectedEvent;

      const yearMatch =
        selectedYear === 'All' ||
        entry.year === Number(selectedYear);

      if (!eventMatch || !yearMatch) return;

      Object.entries(entry.tricks).forEach(
        ([difficulty, list]) => {
          const difficultyMatch =
            selectedDifficulty === 'All' ||
            difficulty === selectedDifficulty;

          if (!difficultyMatch) return;

          list.forEach((t) => filtered.push(t));
        }
      );
    });

    setAvailableTricks(filtered);
    setGeneratedTricks([]);
  }, [selectedEvent, selectedYear, selectedDifficulty]);

  function generateTrick() {
    if (availableTricks.length === 0) return;

    const randomIndex = Math.floor(
      Math.random() * availableTricks.length
    );

    const newTrick = availableTricks[randomIndex];

    setGeneratedTricks((prev) => [newTrick, ...prev]);
  }

  return (
    <div className="card">
      <h2>Trick Generator</h2>

      <p>
        Generate random kendama tricks using filters.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label>Event</label>
          <br />
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            {events.map((event) => (
              <option key={event} value={event}>
                {event}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Year</label>
          <br />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Difficulty</label>
          <br />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={generateTrick}
        disabled={availableTricks.length === 0}
      >
        Generate Trick
      </button>

      <p style={{ marginTop: '1rem' }}>
        Available tricks: {availableTricks.length}
      </p>

      {generatedTricks.length > 0 && (
        <ul style={{ marginTop: '1rem' }}>
          {generatedTricks.map((trick, index) => (
            <li key={`${trick}-${index}`}>
              {trick}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}