import { useState } from 'react';

const TRICKS = [
  'Big Cup', 'Small Cup', 'Spike', 'Around the World', 'Airplane',
  'Lighthouse', 'Lunar', 'Bird', 'Whirlwind', 'Stuntplane',
  'Jumping Stick', 'Gunslinger', 'Inward Big Cup', 'Moshikame',
  'Swing in', 'Swing out', 'Candle', 'Underground', 'Trapeze',
];

function randomTrick() {
  return TRICKS[Math.floor(Math.random() * TRICKS.length)];
}

export default function Generator() {
  const [trick, setTrick] = useState(null);

  return (
    <div className="card">
      <h2>Trick Generator</h2>
      <p>Generate a random kendama trick to practice.</p>
      <button onClick={() => setTrick(randomTrick())}>Generate Trick</button>
      {trick && (
        <ul style={{ marginTop: '1rem' }}>
          <li>{trick}</li>
        </ul>
      )}
    </div>
  );
}
