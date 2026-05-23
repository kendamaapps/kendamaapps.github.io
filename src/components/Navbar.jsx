import { useState } from 'react';

const TABS = [
  { id: 'generator', label: 'Generator' },
  { id: 'timer',     label: 'Timer' },
  { id: 'tracker',   label: 'Tracker' },
];

export default function Navbar({ activeTab, onTabChange }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleTabClick(e, id) {
    e.preventDefault();
    onTabChange(id);
    setMenuOpen(false);
  }

  return (
    <header className="navbar">
      <div className="navbar__container">
        <div className="navbar__brand">
          <span className="navbar__brand-title">Kendama Apps</span>
          <span className="navbar__brand-sub">Modular kendama toolkit</span>
        </div>

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
              <li key={tab.id} className="navbar__item">
                <a
                  href="#"
                  className={`navbar__link${activeTab === tab.id ? ' active' : ''}`}
                  onClick={e => handleTabClick(e, tab.id)}
                >
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
