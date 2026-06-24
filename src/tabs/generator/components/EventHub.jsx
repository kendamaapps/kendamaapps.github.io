export default function EventHub({ events, onSelect }) {
  return (
    <div className="card">
      <h2>Trick Generator</h2>
      <p style={{ marginBottom: '1.5rem' }}>Select an event to start generating tricks:</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
        {events.map((e) => (
          <div
            key={e}
            onClick={() => onSelect(e)}
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
            onMouseEnter={(ev) => {
              ev.currentTarget.style.transform = 'translateY(-2px)';
              ev.currentTarget.style.borderColor = 'var(--color-text-secondary)';
            }}
            onMouseLeave={(ev) => {
              ev.currentTarget.style.transform = 'translateY(0)';
              ev.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            {e === 'All' ? '🌐 All Events' : e}
          </div>
        ))}
      </div>
    </div>
  );
}
