import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatTime } from '../lib/utils';

export default function TimerOverlay({
  status,       // 'countdown' | 'running'
  tricks,
  index,
  elapsed,
  seed,
  difficulty,
  accentColor,
  onTap,
  onAbort,
}) {
  const accent = accentColor || 'var(--color-primary)';
  const isLast = index === tricks.length - 1;

  // Spacebar support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') { e.preventDefault(); onTap(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTap]);

  const ghostStyle = {
    fontSize: '2rem',
    fontWeight: '600',
    opacity: 0.2,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '90vw',
    transform: 'scale(0.85)',
  };

  return createPortal(
    <div
      onClick={onTap}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 99999,
        backgroundColor: 'rgba(10, 18, 30, 0.96)',
        color: '#ffffff',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', alignItems: 'center',
        padding: '2rem 1.5rem', boxSizing: 'border-box',
        textAlign: 'center', cursor: 'pointer', userSelect: 'none',
      }}
    >
      {/* Header bar */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🏁 Speedrun Track &mdash; {difficulty} (Seed: {seed})
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAbort(); }}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Abort Run
        </button>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
        {status === 'countdown' ? (
          <div>
            <h1 style={{ fontSize: '3.5rem', margin: '0 0 1rem 0', color: accent }}>READY</h1>
            <p style={{ fontSize: '1.4rem', opacity: 0.8 }}>
              Tap anywhere on the screen or press [SPACE] to start the clock!
            </p>
            <div style={{ marginTop: '2rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)' }}>
              Total tricks scheduled: {tricks.length}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
              TRICK {index + 1} OF {tricks.length}
            </div>

            {/* Vertical wheel */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
              <div style={{ ...ghostStyle, marginBottom: '0.5rem' }}>
                {index > 0 ? tricks[index - 1] : ' '}
              </div>
              <h1 style={{ fontSize: '3.8rem', fontWeight: '800', margin: '0.5rem 0', lineHeight: '1.2', letterSpacing: '-0.02em', maxWidth: '95vw', wordBreak: 'break-word' }}>
                {tricks[index]}
              </h1>
              <div style={{ ...ghostStyle, marginTop: '0.5rem' }}>
                {!isLast ? tricks[index + 1] : '🏁 [FINISH]'}
              </div>
            </div>

            <p style={{ fontSize: '1.1rem', color: accent, marginTop: '2.5rem' }}>
              {isLast ? '👉 TAP OR [SPACE] TO FINISH RUN' : '👉 TAP OR [SPACE] FOR THE NEXT TRICK'}
            </p>
          </div>
        )}
      </div>

      {/* Timer footer */}
      <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '3.5rem', fontWeight: '700' }}>
          {formatTime(elapsed)}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
          Centisecond Live System Metrics
        </div>
      </div>
    </div>,
    document.body
  );
}
