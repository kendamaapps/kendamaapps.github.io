export function renderTimer(app) {

  app.innerHTML = `
    <div class="card">
      <h2>Practice Timer</h2>

      <h3 id="timerDisplay">60</h3>

      <button id="startTimerBtn">Start Timer</button>
    </div>
  `;

  const display = document.getElementById('timerDisplay');
  const button = document.getElementById('startTimerBtn');

  button.addEventListener('click', () => {

    let time = 60;

    display.textContent = time;

    const interval = setInterval(() => {

      time--;

      display.textContent = time;

      if (time <= 0) {
        clearInterval(interval);
        display.textContent = 'Done';
      }

    }, 1000);
  });
}
