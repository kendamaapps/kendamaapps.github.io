# Kendama Apps

A modular kendama toolkit built with React and Vite, featuring an interactive WebGL galaxy background and an organic melting fluid theme engine for Van Jam event modes.

---

## 🚀 Features & Project Overview

### ⚙️ Core Application Modules

* **Trick Generator** — Randomly picks a kendama trick to practice with customizable multi-burst modes (Generate 6) and smart deduplication proofing.
* **Activity Log** — Review, clear, and save your successfully completed tricks securely across browser sessions.
* **Dynamic Parameter Routing** — Deep-linkable state URLs (e.g., `/generator/vanjam/2026`) that remember your active event configurations.
* **Responsive Navbar** — Collapsible hamburger menu built for mobile optimization alongside standard sticky desktop states.

---

## ⏱️ Competitive Speedrun Engine & Leaderboard

The **Speedrun/Timer Mode** is designed for high-intensity practice, tricklist memory drills, and competitive speedrunning events (such as VanJam, KWC, and Taiwan Kendama Open presets). It shifts the workbench into a distraction-free, fullscreen interface that allows you to cycle through tricks rapidly.

### 🛠️ Quick Start Guide
1. Select an **Event**, **Year**, and **Difficulty** in the main workbench.
2. Toggle on **⏱️ Try Timer Mode**.
3. Select your desired target size (**6-trick sprint** or a **full-pool challenge**).
4. Click **Launch Speedrun Track**.
5. Use your **Spacebar** or click the screen to crush your personal best!

### 🎮 Interface Controls
| Action | Input | Description |
| --- | --- | --- |
| **Start/Progress/Finish** | `Tap` or `Spacebar` | Cycles active wheel. Spacebar blocks page scrolling via `preventDefault()`. |
| **Abort Run** | `Abort` button | Exits the running setup instantly. |

### 🎲 Seed-Based Generation Mechanics

To guarantee absolute fairness and reproducibility in competitive matches, the tricklist generator utilizes a **6-digit deterministic random seed**.

* **How it Works:** When you enter Timer Mode, the application automatically rolls a fresh, random 6-digit code (e.g., `582914`). This number serves as the foundational entropy source for a seeded Pseudo-Random Number Generator (PRNG).
* **The Fisher-Yates Shuffle:** The PRNG controls a customized Fisher-Yates shuffle algorithm to organize the active trick pool. Because the math is entirely deterministic, **the exact same 6-digit seed will always generate the identical sequence of tricks in the exact same order.**
* **Shared Competition:** If multiple players clear out their text inputs and manually type in the same 6-digit code, they will race on the exact same random trick list. Leaving the field completely blank will automatically roll a fresh, fully dynamic random tricks.

### 🏆 Automated Global Leaderboard (Honor System)

When a user successfully completes a speedrun session, they can choose to submit their record to the shared community database directly from the results interface.

#### System Architecture Overview

The scoring engine pipes data through a decoupled serverless workflow to keep front-end deployment fast, lightweight, and dependency-free:

```text
[ React App Layout ]
         │
         ▼  (Fetch HTTP POST Payload)
[ Google Apps Script API Webhook ]  <-- (Secured via GitHub Environment Variables)
         │
         ▼  (Append Row Matrix)
[ Google Sheets Database Log ]
         │
         ▼  (Fetch HTTP GET Response)
[ Global Leaderboard View Hub ] (Separated by Event -> Year -> Difficulty Combinations)

```

#### Logged Metrics

Upon entering a custom player handle and clicking **Submit Score**, the system packages and logs:

* **Timestamp:** The precise date and time the run was certified.
* **Player Name:** The custom user handle entered at completion.
* **Event & Year:** The exact competition context (e.g., `Van Jam`, `2026`).
* **Difficulty:** The filtered trick tier pool configuration.
* **Track Seed:** The 6-digit key used to generate the layout, allowing other players to audit or challenge the exact same run.
* **Tricks Cleared:** Total number of items scheduled in the run pool.
* **Completion Time:** The exact runtime elapsed, formatted down to precise decimal seconds (`SS.CC`).

> ⚠️ **ADMINISTRATIVE POLICY NOTE:** While score tracking runs primarily on an honor system format, the project maintainer reserves the absolute right to delete, clear, or modify any leaderboard submission entry at any time based on their own discretion, justification, or administrative decision (e.g., anti-cheat verification, formatting errors, or cleanup).

---

## 💻 Tech Stack

* **Framework:** [React 19](https://react.dev/) / React Router v7
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Graphics Pipeline:** [OGL](https://github.com/oframe/ogl) — Lightweight WebGL library for the galaxy shader code

### Project Structure

```text
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
        ├── Leaderboard.jsx # Sheets API visual records aggregator 
        └── Log.jsx         # LocalStorage audit trail of verified completions

```

---

## 🛠️ Getting Started

### Installation & Local Setup

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

### Deployment & Routing Configuration

The project deploys automatically to GitHub Pages on every push to `main` via the included GitHub Actions workflow at `.github/workflows/deploy.yml`.

If your site is hosted at a subpath (e.g. `https://yourusername.github.io/kendama-apps/`), update the `base` field in `vite.config.js` to match your repository name:

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

---

### 🌌 Background Visual Mechanics

The cosmic field is driven by a custom GLSL fragment shader script. When moving into specific competition scopes (like Van Jam), the application seamlessly shifts hooks to render vector blob morph containers backed by liquid gooey CSS processing matrices.

#### Cosmic Configurations (`App.jsx`)

| Prop | Value | Effect |
| --- | --- | --- |
| `hueShift` | `150` | Tailored component color maps |
| `saturation` | `0.5` | Standardized star luminance curves |
| `density` | `3` | High density stellar layouts |
| `rotationSpeed` | `0.1` | Moderate atmospheric orbital adjustments |
| `mouseRepulsion` | `true` | Node structural avoidance configurations |
