export function renderGenerator(app) {

  const tricks = [
    'Lighthouse',
    'Lunar',
    'Bird',
    'Whirlwind',
    'Earth Turn',
    'Swing Spike'
  ];

  let count = 0;

  app.innerHTML = `
    <div class="card">
      <h2>Trick Generator</h2>

      <h3 id="trickDisplay">Click generate</h3>

      <button id="generateBtn">Generate</button>

      <p>Generated: <span id="count">0</span></p>
    </div>
  `;

  const display = document.getElementById('trickDisplay');
  const button = document.getElementById('generateBtn');
  const counter = document.getElementById('count');

  button.addEventListener('click', () => {

    const random = tricks[Math.floor(Math.random() * tricks.length)];

    display.textContent = random;

    count++;
    counter.textContent = count;
  });
}
