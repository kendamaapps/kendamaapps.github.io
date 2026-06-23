import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';

// 📝 PASTE YOUR GOOGLE DEPLOYMENT WEB APP URL HERE:
const GOOGLE_SCRIPT_URL = import.meta.env ? import.meta.env.VITE_GOOGLE_SCRIPT_URL : process.env.REACT_APP_GOOGLE_SCRIPT_URL;

export default function Leaderboard() {
  const { eventSlug } = useParams();
  const navigate = useNavigate();

  const [rawScores, setRawScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all scores from Google Sheets on mount
  useEffect(() => {
    async function fetchLeaderboardData() {
      try {
        setIsLoading(true);
        const response = await fetch(GOOGLE_SCRIPT_URL);
        if (!response.ok) throw new Error("Failed to reach database metrics.");
        const data = await response.json();
        setRawScores(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Leaderboard read error:", err);
        setError("Unable to load leaderboard data at this time.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboardData();
  }, []);

  /* =========================================================================
     VIEW CONTROLLER 1: UNIQUE EVENTS COMPILATION ( /leaderboard )
     ========================================================================= */
  const customSortedEvents = useMemo(() => {
    // Extract unique event strings logged in the spreadsheet rows
    const uniqueEvents = Array.from(new Set(rawScores.map(score => score.event)));
    
    const priority = {
      'Van Jam': 1,
      'Kendama World Cup': 2,
      'Taiwan Kendama Open': 3
    };

    return uniqueEvents.sort((a, b) => {
      const priorityA = priority[a] || 99;
      const priorityB = priority[b] || 99;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a.localeCompare(b);
    });
  }, [rawScores]);

  // Match current slug back to actual event text
  const selectedEventName = useMemo(() => {
    if (!eventSlug) return null;
    return customSortedEvents.find(
      e => e.replace(/\s+/g, '').toLowerCase() === eventSlug.toLowerCase()
    );
  }, [eventSlug, customSortedEvents]);

  /* =========================================================================
     VIEW CONTROLLER 2: SUB-LEADERBOARD COMBINATIONS ( /leaderboard/:eventSlug )
     ========================================================================= */
  const separatedLeaderboards = useMemo(() => {
    if (!selectedEventName) return [];

    // Filter down to rows belonging only to this specific event
    const eventRows = rawScores.filter(score => score.event === selectedEventName);

    // Identify all unique combinations of Year + Difficulty + NumTricks present in data
    const combos = [];
    eventRows.forEach(row => {
      const match = combos.find(
        c => c.year === row.year && c.difficulty === row.difficulty && c.numTricks === row.numTricks
      );
      if (!match) {
        combos.push({ year: row.year, difficulty: row.difficulty, numTricks: row.numTricks });
      }
    });

    // Sort combinations: Year descending, Difficulty alphabetically, then NumTricks ascending
    combos.sort((a, b) => {
      if (b.year !== a.year) return b.year.localeCompare(a.year);
      if (a.difficulty !== b.difficulty) return a.difficulty.localeCompare(b.difficulty);
      return (a.numTricks || 0) - (b.numTricks || 0);
    });

    // For each combo group, extract scores, sort ascending by time, and slice top 10 records
    return combos.map(combo => {
      const groupScores = eventRows
        .filter(row => row.year === combo.year && row.difficulty === combo.difficulty && row.numTricks === combo.numTricks)
        .sort((a, b) => a.completionTime - b.completionTime) // Fast times go to top
        .slice(0, 10); // Elite Top 10 focus representation

      return {
        ...combo,
        scores: groupScores
      };
    });
  }, [selectedEventName, rawScores]);

  // Handle Loading & Error States
  if (isLoading) return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><h3>⌛ Fetching global scores...</h3></div>;
  if (error) return <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-error)' }}><h3>{error}</h3></div>;

  /* =========================================================================
     RENDER LAYOUT B: SPECIFIC EVENT POOLS GRID SUBVIEW
     ========================================================================= */
  if (eventSlug) {
    if (!selectedEventName) {
      return (
        <div className="card">
          <Link to="/leaderboard" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>← Back to Leaderboards</Link>
          <h3 style={{ marginTop: '1rem', color: 'var(--color-error)' }}>Event Category Not Found</h3>
        </div>
      );
    }

    return (
      <div className="card">
        <Link to="/leaderboard" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
          ← Back to Leaderboard Categories
        </Link>
        
        <h2 style={{ marginBottom: '1.5rem' }}>🏆 {selectedEventName} Records</h2>

        {separatedLeaderboards.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>No verified track times logged for this category yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {separatedLeaderboards.map((board, idx) => (
              <div 
                key={`${board.year}-${board.difficulty}-${board.numTricks}-${idx}`}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: '8px', 
                  padding: '1.25rem' 
                }}
              >
                <h3 style={{ margin: '0 0 1rem 0', color: selectedEventName === 'Van Jam' ? '#eec14d' : 'var(--color-primary)', fontSize: '1.2rem', borderBottom: '1px dashed var(--color-border)', paddingBottom: '0.5rem' }}>
                  📅 {board.year} &bull; {board.difficulty.toUpperCase()} &bull; {board.numTricks || 0} Tricks
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                        <th style={{ padding: '0.5rem' }}>Rank</th>
                        <th style={{ padding: '0.5rem' }}>Player</th>
                        <th style={{ padding: '0.5rem' }}>Time</th>
                        <th style={{ padding: '0.5rem', fontFamily: 'monospace' }}>Track Seed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {board.scores.map((row, rank) => (
                        <tr 
                          key={`${row.timestamp}-${rank}`} 
                          style={{ 
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: rank === 0 ? 'rgba(238, 193, 77, 0.04)' : 'transparent' // Gold highlight for Rank 1
                          }}
                        >
                          <td style={{ padding: '0.6rem 0.5rem', fontWeight: rank < 3 ? '700' : '400' }}>
                            {rank === 0 ? '🥇 1st' : rank === 1 ? '🥈 2nd' : rank === 2 ? '🥉 3rd' : `${rank + 1}th`}
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem', fontWeight: rank === 0 ? '600' : '400' }}>{row.displayName}</td>
                          <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-success)' }}>
                            {Math.floor(row.completionTime / 60).toString().padStart(2, '0')}:{(Math.floor(row.completionTime) % 60).toString().padStart(2, '0')}.{Math.round((row.completionTime % 1) * 100).toString().padStart(2, '0')}
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'monospace', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                            {row.seed}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* =========================================================================
     RENDER LAYOUT A: STANDARD SELECTION DASHBOARD HUB ( /leaderboard )
     ========================================================================= */
  return (
    <div className="card">
      <h2>Global Leaderboards</h2>
      <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
        Select a custom event discipline below to view active speedrun track records:
      </p>

      {customSortedEvents.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>No global events have logged data to the leaderboard sheet yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {customSortedEvents.map((e) => {
            const slug = e.replace(/\s+/g, '').toLowerCase();
            return (
              <div
                key={e}
                onClick={() => navigate(`/leaderboard/${slug}`)}
                style={{
                  padding: '1.5rem 1rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontWeight: 600,
                  background: 'rgba(26, 46, 69, 0.4)',
                  border: '1px solid var(--color-border)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(el) => {
                  el.currentTarget.style.transform = 'translateY(-2px)';
                  el.currentTarget.style.borderColor = 'var(--color-primary)';
                  el.currentTarget.style.background = 'rgba(26, 46, 69, 0.7)';
                }}
                onMouseLeave={(el) => {
                  el.currentTarget.style.transform = 'translateY(0)';
                  el.currentTarget.style.borderColor = 'var(--color-border)';
                  el.currentTarget.style.background = 'rgba(26, 46, 69, 0.4)';
                }}
              >
                🏆 {e}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}