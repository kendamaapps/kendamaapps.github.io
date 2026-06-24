export default function SpeedrunConfigurator({
  scope,
  seed,
  availableCount,
  accentColor,
  accentTextColor,
  buttonStyles,
  onScopeChange,
  onSeedChange,
  onRerollSeed,
  onLaunch,
}) {
  const activeColor  = accentColor   || 'var(--color-primary)';
  const activeText   = accentTextColor || '#fff';

  const chipStyle = (active) => ({
    background: active ? activeColor : 'transparent',
    color: active ? activeText : 'var(--color-text-secondary)',
    border: 'none',
    padding: '0.4rem 1rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  return (
    <>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
        Select whether you want to race through a standard set of 6 random tricks or clear the entire trick list.
      </p>

      {/* Scope toggle */}
      <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Target Size:</span>
        <div style={{
          display: 'inline-flex',
          background: 'rgba(255,255,255,0.06)',
          padding: '2px',
          borderRadius: '6px',
          border: '1px solid var(--color-border)',
        }}>
          <button type="button" onClick={() => onScopeChange('6')} style={chipStyle(scope === '6')}>
            6 Tricks
          </button>
          <button type="button" onClick={() => onScopeChange('all')} style={chipStyle(scope === 'all')}>
            All Tricks ({availableCount})
          </button>
        </div>
      </div>

      {/* Seed input */}
      <div style={{
        marginBottom: '1.5rem',
        background: 'rgba(0,0,0,0.15)',
        padding: '0.75rem',
        borderRadius: '6px',
        border: '1px solid var(--color-border)',
      }}>
        <label style={{ fontSize: '0.85rem', display: 'block', color: 'var(--color-text-secondary)', marginBottom: '0.4rem', fontWeight: '600' }}>
          Competition Track Seed (6 Digits)
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            maxLength={6}
            value={seed}
            onChange={(e) => onSeedChange(e.target.value.replace(/\D/g, ''))}
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
              textAlign: 'center',
            }}
          />
          <button
            type="button"
            onClick={onRerollSeed}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid var(--color-border)',
              color: '#fff',
              borderRadius: '4px',
            }}
          >
            🎲 Reroll
          </button>
        </div>
        <small style={{ display: 'block', marginTop: '0.4rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
          Share this code with others to race head-to-head on the exact same randomized tricks!
        </small>
      </div>

      <button
        onClick={onLaunch}
        disabled={!availableCount}
        style={{ ...buttonStyles, width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
      >
        Launch Speedrun Track
      </button>
    </>
  );
}
