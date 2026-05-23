import { renderGenerator } from './tabs/generator.js';
import { renderTimer } from './tabs/timer.js';
import { renderTracker } from './tabs/tracker.js';

const app      = document.getElementById('app');
const navLinks = document.querySelectorAll('.navbar__link');

const routes = {
  generator: renderGenerator,
  timer:     renderTimer,
  tracker:   renderTracker
};

function loadTab(name) {
  app.innerHTML = '';
  routes[name](app);
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    loadTab(link.dataset.tab);
  });
});

loadTab('generator');