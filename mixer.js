import { createMixer } from './engine.js';
import { drawLibrary } from './library.js';

const scenes = {
  reading: { name: 'Reading Room', time: '12:07 AM', description: 'Rain draws crooked lines down the tall windows.', levels: [65, 24, 30] },
  stacks: { name: 'Closed Stacks', time: '12:26 AM', description: 'Air turns the pages of a book nobody checked out.', levels: [28, 62, 13] },
  tower: { name: 'Clock Tower', time: '12:53 AM', description: 'The clock still keeps time for the empty floor below.', levels: [40, 41, 68] },
};
const layers = ['rain', 'wind', 'clock'];
const sliders = Object.fromEntries([...layers, 'master'].map(id => [id, document.getElementById(id)]));
const canvas = document.getElementById('library');
const power = document.getElementById('power');
const powerLabel = document.getElementById('power-label');
const status = document.getElementById('status');
const engine = createMixer();
let running = false;

function updateMix() {
  const values = Object.fromEntries(Object.entries(sliders).map(([id, slider]) => {
    document.getElementById(id + '-value').value = slider.value + '%';
    return [id, slider.valueAsNumber / 100];
  }));
  engine.setLevels({ rain: values.rain, wind: values.wind, clock: values.clock });
  engine.setMaster(values.master);
}

function chooseRoom(room) {
  const scene = scenes[room];
  document.getElementById('scene-label').textContent = scene.name;
  document.getElementById('room-time').textContent = scene.time;
  document.getElementById('scene-description').textContent = scene.description;
  layers.forEach((layer, index) => { sliders[layer].value = scene.levels[index]; });
  updateMix();
  drawLibrary(canvas, room);
}

power.addEventListener('click', async () => {
  power.disabled = true;
  try {
    if (running) await engine.pause();
    else await engine.start();
    running = !running;
    power.setAttribute('aria-pressed', String(running));
    powerLabel.textContent = running ? 'Pause audio' : 'Start audio';
    status.dataset.error = 'false';
    status.textContent = running ? 'Audio playing.' : 'Audio paused.';
  } catch {
    status.dataset.error = 'true';
    status.textContent = 'Audio could not start. Try again, or open Afterlight in a recent browser.';
  } finally {
    power.disabled = false;
  }
});

for (const slider of Object.values(sliders)) slider.addEventListener('input', updateMix);
for (const radio of document.querySelectorAll('[name="room"]')) {
  radio.addEventListener('change', () => { if (radio.checked) chooseRoom(radio.value); });
}

chooseRoom('reading');
