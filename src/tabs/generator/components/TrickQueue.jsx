export default function TrickQueue({
  availableTricks,
  generatedTricks,
  accentColor,      // null for default, or a hex string for Van Jam
  onGenerate,
  onGenerateSix,
  onViewAll,
  onComplete,
  onRemove,
  onClear,
  buttonStyles
}) {
  const accent = accentColor || 'var(--color-text-primary)';
  const btnDisabled = !availableTricks.length;
  const clearDisabled = !generatedTricks.length;

  return (
    <>
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button onClick={onGenerate} style={buttonStyles} disabled={btnDisabled}>Generate Trick</button>
        <button onClick={onGenerateSix} style={buttonStyles} disabled={btnDisabled}>Generate 6 Tricks</button>
        <button onClick={onViewAll} style={buttonStyles} disabled={btnDisabled}>
          View All Tricks ({availableTricks.length})
        </button>
        <button
          onClick={onClear}
          disabled={clearDisabled}
          style={{
            ...buttonStyles, 
            cursor: clearDisabled ? 'not-allowed' : 'pointer', 
            opacity: clearDisabled ? 0.5 : 1 
          }}
        >
          Clear Queue
        </button>
      </div>

      <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
        Available tricks: <strong style={{ color: 'var(--color-text-primary)' }}>{availableTricks.length}</strong>
        &nbsp;•&nbsp;
        Queue: <strong style={{ color: accent }}>{generatedTricks.length}</strong>
      </p>

      {generatedTricks.length > 0 && (
        <ul style={{ marginTop: '1rem', padding: 0, listStyle: 'none' }}>
          {generatedTricks.map((trick, index) => (
            <li
              key={`${trick}-${index}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span>{trick}</span>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span
                  onClick={() => onComplete(trick, index)}
                  style={{ color: accent, cursor: 'pointer', fontSize: '1.2rem', userSelect: 'none' }}
                  title="Mark as completed"
                >✓</span>
                <span
                  onClick={() => onRemove(index)}
                  style={{ color: accent, cursor: 'pointer', fontSize: '1.2rem', opacity: 0.7, userSelect: 'none' }}
                  title="Remove from list"
                >×</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
