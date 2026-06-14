import { useState } from 'react';
import { Link, NavLink } from 'react-router';

const TABS = [
  { path: '/', label: 'Home', end: true },          // Path maps to root. 'end' ensures strict matching
  { path: '/generator', label: 'Generator' },
  { path: '/log', label: 'Log' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar__container">
        {/* Use <Link> for the Brand layout instead of onClick/onKeyDown div hacks */}
        <Link 
          to="/" 
          className="navbar__brand" 
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={() => setMenuOpen(false)}
        >
          <span className="navbar__brand-title">Kendama Apps</span>
          <span className="navbar__brand-sub">Modular kendama toolkit</span>
        </Link>

        <button
          className={`navbar__toggle${menuOpen ? ' is-active' : ''}`}
          aria-label="Toggle navigation"
          aria-controls="navbarMenu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        <nav id="navbarMenu" className={`navbar__menu${menuOpen ? ' is-active' : ''}`} role="navigation">
          <ul className="navbar__list">
            {TABS.map(tab => (
              <li key={tab.path} className="navbar__item">
                {/* <NavLink> auto-toggles the class name if active. 
                  use a function in className to combine custom styling structure.
                */}
                <NavLink
                  to={tab.path}
                  end={tab.end}
                  className={({ isActive }) => 
                    `navbar__link${isActive ? ' active' : ''}`
                  }
                  onClick={() => setMenuOpen(false)} // Auto-collapses responsive mobile dropdown menu
                >
                  {tab.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}