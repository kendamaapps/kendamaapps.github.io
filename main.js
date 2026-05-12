import { renderGenerator } from './tabs/generator.js';
import { renderTimer } from './tabs/timer.js';
import { renderTracker } from './tabs/tracker.js';

const app = document.getElementById('app');
const tabs = document.querySelectorAll('.tab');

const routes = {
  generator: renderGenerator,
  timer: renderTimer,
  tracker: renderTracker
};

function loadTab(name) {
  app.innerHTML = '';
  routes[name](app);
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {

    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    loadTab(tab.dataset.tab);
  });
});

loadTab('generator');
