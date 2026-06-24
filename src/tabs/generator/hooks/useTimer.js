import { useEffect, useRef, useState } from 'react';
import { createSeededRandom, seededShuffle, seededPick, randomSixDigitSeed } from '../lib/prng';

const INITIAL_STATE = {
  status: 'config',      // 'config' | 'countdown' | 'running' | 'results'
  tricks: [],
  index: 0,
  elapsed: 0,
  seed: '',
  scope: '6',            // '6' | 'all'
};

export function useTimer({ availableTricks, onComplete }) {
  const [status, setStatus]   = useState(INITIAL_STATE.status);
  const [tricks, setTricks]   = useState(INITIAL_STATE.tricks);
  const [index, setIndex]     = useState(INITIAL_STATE.index);
  const [elapsed, setElapsed] = useState(INITIAL_STATE.elapsed);
  const [seed, setSeed]       = useState(INITIAL_STATE.seed);
  const [scope, setScope]     = useState(INITIAL_STATE.scope);

  const intervalRef  = useRef(null);
  const startTimeRef = useRef(0);

  // Auto-roll a fresh seed whenever returning to config with no seed set
  useEffect(() => {
    if (status === 'config' && !seed) setSeed(randomSixDigitSeed());
  }, [status, seed]);

  // Cleanup interval on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  function reset() {
    clearInterval(intervalRef.current);
    setStatus('config');
    setTricks([]);
    setIndex(0);
    setElapsed(0);
    setSeed('');
  }

  function launch() {
    if (!availableTricks.length) return;

    let finalSeed = seed.trim() || randomSixDigitSeed();
    setSeed(finalSeed);

    const rng = createSeededRandom(finalSeed);
    const selected = scope === '6'
      ? seededPick(availableTricks, 6, rng)
      : seededShuffle([...availableTricks], rng);

    setTricks(selected);
    setIndex(0);
    setElapsed(0);
    setStatus('countdown');
  }

  function start() {
    setStatus('running');
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 10);
  }

  function tap() {
    if (status === 'countdown') { start(); return; }
    if (status !== 'running') return;

    if (index < tricks.length - 1) {
      setIndex(i => i + 1);
    } else {
      clearInterval(intervalRef.current);
      setStatus('results');
      onComplete?.();
    }
  }

  return {
    // state
    status, tricks, index, elapsed, seed, scope,
    // setters
    setSeed, setScope,
    // actions
    reset, launch, tap,
  };
}
