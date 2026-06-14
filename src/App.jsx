import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Navbar from './components/Navbar.jsx';
import Galaxy from './components/Galaxy.jsx';

import Home from './tabs/Home.jsx';
import Generator from './tabs/Generator.jsx';
import Log from './tabs/Log.jsx';

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
      <div id="galaxy-bg">
        <Galaxy 
          mouseRepulsion
          mouseInteraction
          density={3}
          glowIntensity={0.5}
          saturation={0.5}
          hueShift={150}
          twinkleIntensity={0.5}
          rotationSpeed={0.1}
          repulsionStrength={2}
          autoCenterRepulsion={0}
          starSpeed={0.5}
          speed={1.5}
        />
      </div>
      
      <Navbar />

      <main id="app">
        {/* App.jsx (Inside <Routes> block) */}
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* 💡 Update this route to accept an optional parameter using the "?" syntax */}
          <Route 
            path="/generator/:event?" 
            element={
              <Generator 
                onLogTrick={addLogEntry}
                generatedTricks={generatedQueue}
                setGeneratedTricks={setGeneratedQueue}
              />
            } 
          />
          
          <Route path="/log" element={<Log logs={trickHistory} onClearLogs={clearLogs} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}