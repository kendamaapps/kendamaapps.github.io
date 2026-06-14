import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import Navbar from './components/Navbar.jsx';
import Galaxy from './components/Galaxy.jsx';

import Home from './tabs/Home.jsx';
import Generator from './tabs/Generator.jsx';
import Log from './tabs/Log.jsx';
import About from './tabs/About.jsx';

// dynamic background layer
function AppBackground() {
  const location = useLocation();
  
  // Check if the pathname STARTS with generator/vanjam to account for trailing years
  const isVanJam = location.pathname.toLowerCase().startsWith('/generator/vanjam');

  if (isVanJam) {
    return (
      <>
        <div className="vanjam-bg-container">
          {/* Squiggly Blob 1 */}
          <svg className="vanjam-blob vanjam-blob--1" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <path fill="var(--color-surface)" d="M410,290Q340,380,250,400Q160,420,110,330Q60,240,120,150Q180,60,290,100Q400,140,410,290Z" />
          </svg>

          {/* Squiggly Blob 2 */}
          <svg className="vanjam-blob vanjam-blob--2" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <path fill="var(--color-surface)" d="M440,310Q400,420,290,410Q180,400,100,310Q20,220,100,140Q180,60,300,90Q420,120,440,310Z" />
          </svg>

          {/* Squiggly Blob 3 */}
          <svg className="vanjam-blob vanjam-blob--3" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <path fill="var(--color-surface)" d="M390,280Q330,360,240,350Q150,340,120,250Q90,160,180,110Q270,60,340,140Q410,220,390,280Z" />
          </svg>
        </div>

        {/* The Gooey melting filter */}
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ display: 'none' }}>
          <defs>
            <filter id="organic-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur" />
              <feColorMatrix 
                in="blur" 
                mode="matrix" 
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -18" 
                result="goo" 
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
      </>
    );
  }

  return (
    <div id="galaxy-bg">
      <Galaxy 
        mouseRepulsion mouseInteraction density={3} glowIntensity={0.5}
        saturation={0.5} hueShift={150} twinkleIntensity={0.5}
        rotationSpeed={0.1} repulsionStrength={2} autoCenterRepulsion={0}
        starSpeed={0.5} speed={1.5}
      />
    </div>
  );
}

export default function App() {
  const [generatedQueue, setGeneratedQueue] = useState([]);
  const [trickHistory, setTrickHistory] = useState(() => {
    const saved = localStorage.getItem('kendama_trick_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kendama_trick_logs', JSON.stringify(trickHistory));
  }, [trickHistory]);

  const addLogEntry = (trickName) => {
    const newEntry = {
      id: crypto.randomUUID(),
      name: trickName,
      timestamp: new Date().toLocaleString(),
    };
    setTrickHistory((prev) => [newEntry, ...prev]);
  };

  const clearLogs = () => setTrickHistory([]);

  return (
    <BrowserRouter>
      {/* reactive background */}
      <AppBackground />
      
      <Navbar />

      <main id="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/generator" 
            element={
              <Generator 
                onLogTrick={addLogEntry}
                generatedTricks={generatedQueue}
                setGeneratedTricks={setGeneratedQueue}
              />
            } 
          />
          <Route 
            path="/generator/:event" 
            element={
              <Generator 
                onLogTrick={addLogEntry}
                generatedTricks={generatedQueue}
                setGeneratedTricks={setGeneratedQueue}
              />
            } 
          />
          <Route 
            path="/generator/:event/:year" 
            element={
              <Generator 
                onLogTrick={addLogEntry}
                generatedTricks={generatedQueue}
                setGeneratedTricks={setGeneratedQueue}
              />
            } 
          />
          <Route path="/log" element={<Log logs={trickHistory} onClearLogs={clearLogs} />} />
          
          <Route path="/about" element={<About />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}