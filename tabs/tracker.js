export function renderTracker(app) {

  app.innerHTML = `
    <div class="card">
      <h2>Session Tracker</h2>

      <input id="trickInput" placeholder="Enter landed trick">

      <button id="addBtn">Add</button>

      <ul id="list"></ul>
    </div>
  `;

  const input = document.getElementById('trickInput');
  const button = document.getElementById('addBtn');
  const list = document.getElementById('list');

  button.addEventListener('click', () => {

    const value = input.value.trim();

    if (!value) return;

    const li = document.createElement('li');

    li.textContent = value;

    list.prepend(li);

    input.value = '';
  });
}
