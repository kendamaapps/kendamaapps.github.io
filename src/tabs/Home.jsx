import { useMemo } from 'react';
import { useNavigate } from 'react-router';

export default function Home() {
  const navigate = useNavigate(); // Initialize navigation tool

  const features = useMemo(() => [
    {
      title: 'Trick Generator',
      description: 'Generate random tricks with custom filters, preset event modes, and a built-in deterministic speedrun timer setup.',
      tag: 'Generator',
      path: '/generator',
    },
    {
      title: 'Global Leaderboards',
      description: 'View elite speedrun track records, filtered by individual competition events, year categories, and trick difficulty tiers.',
      tag: 'Leaderboard',
      path: '/leaderboard',
    },
    {
      title: 'Trick Log',
      description: 'Review your session audit trails and local history of successfully completed tricks saved across your browser sessions.',
      tag: 'Log',
      path: '/log',
    },
  ], []);

  return (
    <div className="card">
      <h2>Home</h2>
      <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>Kendama!</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {features.map((f) => (
          <div
            key={f.title}
            onClick={() => navigate(f.path)} // Use navigate to switch paths cleanly
            style={{
              padding: '1.25rem 1rem',
              borderRadius: '8px',
              background: 'rgba(26, 46, 69, 0.4)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.transform = 'translateY(-2px)'; 
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.background = 'rgba(26, 46, 69, 0.6)';
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.transform = 'translateY(0)'; 
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.background = 'rgba(26, 46, 69, 0.4)';
            }}
          >
            <div style={{ fontSize: '0.75rem', color: f.tag === 'Leaderboard' ? '#eec14d' : 'var(--color-primary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              🏆 {f.tag}
            </div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.4rem' }}>
              {f.title}
            </div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
              {f.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}