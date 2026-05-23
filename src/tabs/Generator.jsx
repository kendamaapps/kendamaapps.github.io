import { useEffect, useMemo, useState } from 'react';
import tricks from '../../data/tricks.json';

/**
 * Example tricks.json structure:
 *
 * [
 *   {
 *     "event": "NACO 2025",
 *     "year": 2025,
 *     "tricks": {
 *       "beginner": [
 *         "Around Juggle Spike",
 *         "Whirlwind"
 *       ],
 *       "advanced": [
 *         "Lunar Triple Lunar"
 *       ]
 *     }
 *   },
 *   {
 *     "event": "Battle at the Border",
 *     "year": 2024,
 *     "tricks": {
 *       "intermediate": [
 *         "Bird Over the Valley"
 *       ]
 *     }
 *   }
 * ]
 */

export default function Generator() {
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const [availableTricks, setAvailableTricks] = useState([]);
  const [generatedTrick, setGeneratedTrick] = useState(null);

  /**
   * Extract all unique events from the dataset.
   */
  const events = useMemo(() => {
    return [
      'All',
      ...new Set(tricks.map((entry) => entry.event))
    ];
  }, []);

  /**
   * Extract all unique years from the dataset.
   */
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

  /**
   * Extract all unique difficulty categories
   * from the nested tricks object.
   */
  const difficulties = useMemo(() => {
    const levels = new Set();

    tricks.forEach((entry) => {
      Object.keys(entry.tricks).forEach((difficulty) => {
        levels.add(difficulty);
      });
    });

    return ['All', ...Array.from(levels)];
  }, []);

  /**
   * Build the filtered trick pool whenever filters change.
   */
  useEffect(() => {
    const filtered = [];

    tricks.forEach((entry) => {
      const eventMatch =
        selectedEvent === 'All' ||
        entry.event === selectedEvent;

      const yearMatch =
        selectedYear === 'All' ||
        entry.year === Number(selectedYear);

      if (!eventMatch || !yearMatch) {
        return;
      }

      Object.entries(entry.tricks).forEach(
        ([difficulty, tricks]) => {
          const difficultyMatch =
            selectedDifficulty === 'All' ||
            difficulty === selectedDifficulty;

          if (!difficultyMatch) {
            return;
          }

          tricks.forEach((trick) => {
            filtered.push({
              name: trick,
              difficulty,
              event: entry.event,
              year: entry.year
            });
          });
        }
      );
    });

    setAvailableTricks(filtered);
    setGeneratedTrick(null);
  }, [selectedEvent, selectedYear, selectedDifficulty]);

  /**
   * Generate a random trick from the filtered pool.
   */
  function generateTrick() {
    if (availableTricks.length === 0) {
      setGeneratedTrick(null);
      return;
    }

    const randomIndex = Math.floor(
      Math.random() * availableTricks.length
    );

    setGeneratedTrick(availableTricks[randomIndex]);
  }

  return (
    <div className="card">
      <h2>Trick Generator</h2>

      <p>
        Generate a random kendama trick using
        event, year, and difficulty filters.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1rem'
        }}
      >
        <div>
          <label>Event</label>
          <br />

          <select
            value={selectedEvent}
            onChange={(e) =>
              setSelectedEvent(e.target.value)
            }
          >
            {events.map((event) => (
              <option
                key={event}
                value={event}
              >
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
            onChange={(e) =>
              setSelectedYear(e.target.value)
            }
          >
            {years.map((year) => (
              <option
                key={year}
                value={year}
              >
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
            onChange={(e) =>
              setSelectedDifficulty(e.target.value)
            }
          >
            {difficulties.map((difficulty) => (
              <option
                key={difficulty}
                value={difficulty}
              >
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

      {generatedTrick && (
        <div style={{ marginTop: '1rem' }}>
          <h3>{generatedTrick.name}</h3>

          <ul>
            <li>
              Difficulty:{' '}
              {generatedTrick.difficulty}
            </li>

            <li>
              Event: {generatedTrick.event}
            </li>

            <li>
              Year: {generatedTrick.year}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}