import React from 'react';

// Crisp, lightweight inline SVG Icons
const GitHubIcon = () => (
  <svg style={{ width: '18px', height: '18px', fill: 'currentColor', verticalAlign: 'middle' }} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.48.0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const InstagramIcon = () => (
  <svg style={{ width: '18px', height: '18px', fill: 'currentColor', verticalAlign: 'middle' }} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const KofiIcon = () => (
  <svg style={{ width: '19px', height: '19px', fill: 'currentColor', verticalAlign: 'middle' }} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.723.688-.723.688l-.006 11.972c0 1.936 1.704 3.94 3.94 3.94h10.987c4.116 0 5.432-3.414 5.714-4.729 2.116-.214 3.957-1.309 3.957-4.111a4.845 4.845 0 0 0-.711-3.167zM18.1 14.39a3.523 3.523 0 0 1-3.136 1.834H3.94c-1.042 0-1.854-.83-1.854-1.854V6.438h16.035c.033.033.111 2.348-.021 7.952zm4.015-2.22c0 1.254-.848 1.755-1.905 1.859V8.536c1.025.033 1.905.419 1.905 1.755v1.879zm-11.1-4.71a.488.488 0 0 0-.39-.187h-.008a.486.486 0 0 0-.39.187l-2.4 2.856a.514.514 0 0 0-.083.504c.057.147.2.244.358.244h1.341v2.54a.493.493 0 0 0 .493.493h1.385a.493.493 0 0 0 .493-.493v-2.54h1.341a.494.494 0 0 0 .358-.244.514.514 0 0 0-.083-.504l-2.4-2.856z" />
  </svg>
);

export default function About() {
  const LAST_UPDATED = "June 14, 2026";

  const linkStyles = {
    color: 'var(--color-primary)', 
    textDecoration: 'none',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.35rem'
  };

  const labelStyles = {
    color: 'var(--color-text-secondary)', 
    display: 'block', 
    fontSize: '0.85rem', 
    fontWeight: '600', 
    letterSpacing: '0.05em'
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>About Kendama Apps</h2>
      <p style={{ lineHeight: '1.6', margin: '1rem 0', color: 'var(--color-text-body)' }}>
        A modular toolkit built for kendama players to practice competition sets with randomize combinations and track progression over time.
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1.5rem 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* OPEN SOURCE CONTRIBUTION PORTAL */}
        <div>
          <span style={labelStyles}>CONTRIBUTE TO THE PROJECT</span>
          <a 
            href="https://github.com/kendamaapps/kendamaapps.github.io" 
            target="_blank" 
            rel="noopener noreferrer"
            style={linkStyles}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            <GitHubIcon /> GitHub Organization (kendamaapps)
          </a>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Found a bug or want to submit new competition trick lists? Open a Pull Request or file an Issue on our dedicated open-source repository!
          </p>
        </div>

        {/* GITHUB DEVELOPMENT ENTRY */}
        <div>
          <span style={labelStyles}>PERSONAL DEVELOPER PROFILE</span>
          <a 
            href="https://github.com/Harrisonlee0530" 
            target="_blank" 
            rel="noopener noreferrer"
            style={linkStyles}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            <GitHubIcon /> @Harrisonlee0530
          </a>
        </div>

        {/* CONNECT ON INSTAGRAM */}
        <div>
          <span style={labelStyles}>CONNECT ON INSTAGRAM</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.35rem' }}>
            <a 
              href="https://instagram.com/harrison.kendama" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ ...linkStyles, marginTop: 0 }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              <InstagramIcon /> @harrison.kendama <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--color-text-secondary)' }}>(Kendama)</span>
            </a>
            <a 
              href="https://instagram.com/harrisonlee123456" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ ...linkStyles, marginTop: 0 }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              <InstagramIcon /> @harrisonlee123456 <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--color-text-secondary)' }}>(Personal)</span>
            </a>
          </div>
        </div>

        {/* SUPPORT / KO-FI SECTION */}
        <div>
          <span style={labelStyles}>SUPPORT THE COMMUNITY</span>
          <a 
            href="https://ko-fi.com/harrisonlee123456" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ ...linkStyles, color: '#ff5e5b' }} 
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            <KofiIcon /> Buy me a string pack on Ko-fi
          </a>
        </div>

        {/* VERSION TRACKING METRICS */}
        <div>
          <span style={labelStyles}>LAST UPDATED</span>
          <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginTop: '0.35rem', fontWeight: '600' }}>
            {LAST_UPDATED}
          </strong>
        </div>

      </div>
    </div>
  );
}