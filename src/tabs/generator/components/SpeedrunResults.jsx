import { formatTime } from '../lib/utils';

export default function SpeedrunResults({
  elapsed,
  trickCount,
  seed,
  accentColor,
  buttonStyles,
  displayName,
  isSubmitting,
  submitStatus,
  onDisplayNameChange,
  onSubmit,
  onRunAgain,
}) {
  const accent = accentColor || 'var(--color-primary)';
  const canSubmit = !isSubmitting && displayName.trim();

  return (
    <div style={{ textAlign: 'center', padding: '0.5rem' }}>
      <h4 style={{ color: 'var(--color-success)', fontSize: '1.3rem', margin: '0 0 0.5rem 0' }}>
        🎉 Set Complete!
      </h4>
      <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
        Cleared <strong>{trickCount}</strong> tricks in:
      </p>
      <div style={{ fontSize: '2.2rem', fontWeight: '700', fontFamily: 'monospace', margin: '0.5rem 0', color: accent }}>
        {formatTime(elapsed)}
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
        Track Seed: <strong style={{ fontFamily: 'monospace' }}>{seed}</strong>
      </p>

      {/* Leaderboard submit */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        padding: '1rem',
        borderRadius: '6px',
        border: '1px solid var(--color-border)',
        marginBottom: '1.5rem',
        textAlign: 'left',
      }}>
        <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>
          Submit Score to Leaderboard
        </label>

        {submitStatus !== 'success' ? (
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <input
              type="text"
              value={displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              placeholder="Enter your name/handle"
              disabled={isSubmitting}
              style={{
                padding: '0.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '0.95rem',
              }}
            />
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              style={{
                ...buttonStyles,
                padding: '0.5rem',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                opacity: canSubmit ? 1 : 0.6,
                fontSize: '0.9rem',
              }}
            >
              {isSubmitting ? '⌛ Uploading...' : '🚀 Submit Score'}
            </button>
            {submitStatus === 'error' && (
              <small style={{ color: 'var(--color-error)', marginTop: '0.25rem' }}>
                ❌ Error uploading score. Please try again.
              </small>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--color-success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0' }}>
            ✅ Score logged to leaderboard successfully!
          </div>
        )}
      </div>

      <button onClick={onRunAgain} style={{ padding: '0.5rem 1rem', width: '100%' }}>
        🔄 Run Again (New Seed)
      </button>
    </div>
  );
}
