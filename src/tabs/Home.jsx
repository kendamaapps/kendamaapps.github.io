import { useMemo } from 'react';

export default function Home({ onTabChange }) {
  const features = useMemo(() => [
    {
      title: 'Trick Generator',
      description: 'Generate tricks from events',
      tag: 'Generator',
      tab: 'generator',
    },
    {
      title: 'Trick Log',
      description: 'Logs Tricks',
      tag: 'Log',
      tab: 'log',
    },
  ], []);

  return (
    <div className="card">
      <h2>Home</h2>

      <p style={{ marginBottom: '1.5rem' }}>
        Kendama!
      </p>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {features.map((f) => (
          <div
            key={f.title}
            onClick={() => onTabChange(f.tab)}
            style={{
              padding: '1rem',
              borderRadius: '8px',
              background: 'rgba(26, 46, 69, 0.6)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.3rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {f.tag}
            </div>

            <div
              style={{
                fontWeight: 600,
                marginBottom: '0.3rem',
              }}
            >
              {f.title}
            </div>

            <div
              style={{
                color: 'var(--color-text-body)',
                fontSize: '0.9rem',
              }}
            >
              {f.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}