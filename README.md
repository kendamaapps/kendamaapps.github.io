# Kendama Apps

A modular kendama toolkit built with React and Vite, featuring an interactive WebGL galaxy background and an organic melting fluid theme engine for Van Jam event modes.

## Features

- **Trick Generator** — Randomly picks a kendama trick to practice with customizable multi-burst modes (Generate 6) and smart deduplication proofing.
- **Dynamic Parameter Routing** — Deep-linkable state URLs (e.g., `/generator/vanjam/2026`) that remember your active event configurations.
- **Activity Log** — Review, clear, and save your successfully completed tricks securely across browser sessions.
- **Galaxy Background** — Interactive WebGL star field powered by OGL, complete with smooth physics-based mouse repulsion.
- **Responsive Navbar** — Collapsible hamburger menu built for mobile optimization alongside standard sticky desktop states.

## Tech Stack

- [React 19](https://react.dev/) / React Router v7
- [Vite](https://vitejs.dev/)
- [OGL](https://github.com/oframe/ogl) — Lightweight WebGL library for the galaxy shader code

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
kendama/
├── index.html              # Vite entry point & SPA redirect listener
├── package.json            # React core dependencies, Router, and OGL configurations
├── package-lock.json
├── vite.config.js
├── data/
    └── structured_tricks.json # Deduplicated competition tricklist database
├── public/
    └── 404.html            # SPA route interception script for GitHub Pages
└── src/
    ├── main.jsx            # ReactDOM core setup
    ├── App.jsx             # Main routing hubs, global state handlers, and background wrappers
    ├── style.css           # Core components styling + Van Jam override themes
    ├── components/
    │   ├── Navbar.jsx      # Sticky responsive navigation system
    │   ├── Galaxy.css      # Custom starfield spatial configurations
    │   └── Galaxy.jsx      # WebGL fragment shader component
    └── tabs/
        ├── Home.jsx        # Landing dashboard
        ├── Generator.jsx   # Pool selector engine and randomizer workbench
        └── Log.jsx         # LocalStorage audit trail of verified completions

```

## Deployment & Routing Fixes

The project deploys automatically to GitHub Pages on every push to `main` via the included GitHub Actions workflow at `.github/workflows/deploy.yml`.

If your site is hosted at a subpath (e.g. `https://you.github.io/kendama-apps/`), update the `base` field in `vite.config.js` to match your repository name:

```js
export default defineConfig({
  plugins: [react()],
  base: '/kendama-apps/',
});

```

### GitHub Pages Deep-Linking (`public/404.html`)

Because GitHub Pages hosts static sites, hitting refresh or navigating directly to a deep link like `/generator/vanjam/2026` will natively cause a server-side 404 error.

To fix this, the project includes a script inside `public/404.html` paired with a listener inside `index.html`. When a user lands on a deep-linked URL:

1. The server triggers `404.html`.
2. The internal script catches the deep path, encodes it into a safe custom query parameter, and redirects back to the homepage.
3. The initialization script inside `index.html` parses that parameter and feeds it instantly back to React Router—preserving the target link seamlessly without breaking browser history.

## Background Mechanics

The cosmic field is driven by a custom GLSL fragment shader script. When moving into specific competition scopes (like Van Jam), the application seamlessly shifts hooks to render vector blob morph containers backed by liquid gooey CSS processing matrices.

### Cosmic Configurations (`App.jsx`)

| Prop | Value | Effect |
| --- | --- | --- |
| `hueShift` | `150` | Tailored component color maps |
| `saturation` | `0.5` | Standardized star luminance curves |
| `density` | `3` | High density stellar layouts |
| `rotationSpeed` | `0.1` | Moderate atmospheric orbital adjustments |
| `mouseRepulsion` | `true` | Node structural avoidance configurations |