import { useMemo } from 'react';

export default function Home() {
  const features = useMemo(() => [
    {
      title: 'Trick Generator',
      description: 'Generate kendama tricks using event, year, and difficulty filters.',
      tag: 'Generator'
    },
    {
      title: 'Progress Tracker',
      description: 'Track completed tricks within a session.',
      tag: 'Tracker'
    },
    {
      title: 'Timer Mode',
      description: 'Timed sessions for structured practice blocks.',
      tag: 'Timer'
    }
  ], []);

  return (
    <div className="card">
      <h2>Home</h2>

      <p style={{ marginBottom: '1.5rem' }}>
        Training dashboard for structured kendama practice and progression tracking.
      </p>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {features.map((f) => (
          <div
            key={f.title}
            style={{
              padding: '1rem',
              borderRadius: '8px',
              background: 'rgba(26, 46, 69, 0.6)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.3rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              {f.tag}
            </div>

            <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
              {f.title}
            </div>

            <div style={{ color: 'var(--color-text-body)', fontSize: '0.9rem' }}>
              {f.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}