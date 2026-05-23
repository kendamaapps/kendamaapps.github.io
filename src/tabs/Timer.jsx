import { useState, useRef } from 'react';

function fmt(ms) {
  const totalSeconds = Math.floor(ms / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const cs = Math.floor((ms % 1000) / 10);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

export default function Timer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const startRef = useRef(null);

  function start() {
    startRef.current = Date.now() - elapsed;
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startRef.current);
    }, 16);
    setRunning(true);
  }

  function stop() {
    clearInterval(intervalRef.current);
    setRunning(false);
  }

  function reset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setElapsed(0);
  }

  return (
    <div className="card">
      <h2>Timer</h2>
      <p style={{ fontSize: '2.5rem', fontFamily: 'monospace', margin: '1rem 0' }}>{fmt(elapsed)}</p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {!running
          ? <button onClick={start}>Start</button>
          : <button onClick={stop}>Stop</button>
        }
        <button onClick={reset} style={{ background: 'var(--color-border)' }}>Reset</button>
      </div>
    </div>
  );
}
