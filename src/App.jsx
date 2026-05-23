import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Galaxy from './components/Galaxy.jsx';
import Generator from './tabs/Generator.jsx';
import Timer from './tabs/Timer.jsx';
import Tracker from './tabs/Tracker.jsx';

const TABS = {
  generator: Generator,
  timer:     Timer,
  tracker:   Tracker,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const TabComponent = TABS[activeTab];

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
          autoCenterRepulsion={2}
          starSpeed={0.5}
          speed={1}
        />
      </div>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main id="app">
        <TabComponent />
      </main>
    </>
  );
}
