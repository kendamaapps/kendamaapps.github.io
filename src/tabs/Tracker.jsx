import { useState } from 'react';

export default function Tracker() {
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState([]);

  function add() {
    const val = input.trim();
    if (!val) return;
    setEntries(prev => [{ id: Date.now(), text: val }, ...prev]);
    setInput('');
  }

  function remove(id) {
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  return (
    <div className="card">
      <h2>Trick Tracker</h2>
      <p>Log tricks you've landed.</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Trick name..."
        />
        <button onClick={add}>Add</button>
      </div>
      {entries.length > 0 && (
        <ul>
          {entries.map(e => (
            <li key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{e.text}</span>
              <button
                onClick={() => remove(e.id)}
                style={{ background: 'transparent', color: 'var(--color-text-secondary)', padding: '0.2rem 0.5rem', fontSize: '1rem' }}
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
