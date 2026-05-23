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
        <Galaxy />
      </div>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main id="app">
        <TabComponent />
      </main>
    </>
  );
}
