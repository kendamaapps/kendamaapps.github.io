# Kendama Apps

A modular kendama toolkit built with React and Vite, featuring an interactive WebGL galaxy background.

## Features

- **Trick Generator** — randomly picks a kendama trick to practice
- **Timer** — centisecond-precision stopwatch for timed sessions
- **Trick Tracker** — log and manage tricks you've landed
- **Galaxy Background** — interactive WebGL star field powered by OGL, with mouse repulsion
- **Responsive Navbar** — collapsible hamburger menu on mobile, sticky on desktop

## Tech Stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [OGL](https://github.com/oframe/ogl) — lightweight WebGL library for the galaxy shader

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
├── index.html              # Vite entry
├── package.json            # React 18, Vite, OGL
├── vite.config.js
├── data/
    └── structured_tricks.json # tricklists data
└── src/
    ├── main.jsx            # ReactDOM.createRoot
    ├── App.jsx             # Tab state, renders Navbar + active tab
    ├── style.css           # All existing styles (unchanged)
    ├── components/
    │   ├── Navbar.jsx      # Hamburger + tab links, driven by props
    │   ├── Galaxy.css      # Galaxy style css
    │   └── Galaxy.jsx      # OGL shader component (direct port from React Bits)
    └── tabs/
        ├── Home.jsx        # Homepage
        ├── Generator.jsx   # Random trick picker
        ├── Timer.jsx       # Centisecond stopwatch
        └── Tracker.jsx     # Add/remove landed tricks
```

## Deployment

The project deploys automatically to GitHub Pages on every push to `main` via the included GitHub Actions workflow at `.github/workflows/deploy.yml`.

If your site is hosted at a subpath (e.g. `https://you.github.io/kendama-apps/`), update the `base` field in `vite.config.js` to match your repository name:

```js
export default defineConfig({
  plugins: [react()],
  base: '/kendama-apps/',
});
```

## Galaxy Background

The galaxy is powered by a GLSL fragment shader via the [React Bits Galaxy component](https://www.reactbits.dev/). Key props are set in `App.jsx`:

| Prop | Value | Effect |
|---|---|---|
| `hueShift` | `220` | Blue-shifted star colors |
| `saturation` | `0.7` | Vivid star colors |
| `density` | `1.2` | Slightly denser star field |
| `rotationSpeed` | `0.04` | Slow automatic rotation |
| `mouseRepulsion` | `true` | Stars repel from cursor |

To adjust the effect, edit the props passed to `<Galaxy />` in `src/App.jsx`.