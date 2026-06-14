import { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Galaxy from './components/Galaxy.jsx';

import Home from './tabs/Home.jsx';
import Generator from './tabs/Generator.jsx';
import Log from './tabs/Log.jsx';

const TABS = {
  home: Home,
  generator: Generator,
  log: Log,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  
  // Load initial logs from localStorage if they exist
  const [trickHistory, setTrickHistory] = useState(() => {
    const saved = localStorage.getItem('kendama_trick_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('kendama_trick_logs', JSON.stringify(trickHistory));
  }, [trickHistory]);

  const addLogEntry = (trickName) => {
    const newEntry = {
      id: crypto.randomUUID(), // unique ID for React lists
      name: trickName,
      timestamp: new Date().toLocaleString(), // friendly readable date
    };
    setTrickHistory(prev => [newEntry, ...prev]);
  };

  const clearLogs = () => {
    setTrickHistory([]);
  };

  // Determine which component to render and prepare its required props
  const TabComponent = TABS[activeTab];
  const tabProps = {};
  
  if (activeTab === 'home') {
    tabProps.onTabChange = setActiveTab;
  } else if (activeTab === 'generator') {
    tabProps.onLogTrick = addLogEntry;
  } else if (activeTab === 'log') {
    tabProps.logs = trickHistory;
    tabProps.onClearLogs = clearLogs;
  }

  return (
    <>
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
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main id="app">
        <TabComponent {...tabProps} />
      </main>
    </>
  );
}