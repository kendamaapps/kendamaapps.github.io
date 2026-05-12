const tricks = [
  "Lighthouse",
  "Juggle",
  "Earth Turn",
  "Bird",
  "Lunar",
  "Around Japan",
  "Swing Spike",
  "Stunt Plane",
  "Whirlwind",
  "Fast Hands",
  "Airplane",
  "Gunslinger"
];

const trickElement = document.getElementById("trick");
const button = document.getElementById("generateBtn");
const countElement = document.getElementById("count");

let count = 0;

button.addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * tricks.length);
  trickElement.textContent = tricks[randomIndex];

  count++;
  countElement.textContent = count;
});
