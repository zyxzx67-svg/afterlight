// Paint the scene with generated geometry so it needs no external images.
const palette = {
  reading: { wall: '#29322b', sky: '#425547', glow: '#cc9c49', seed: 421 },
  stacks: { wall: '#292c23', sky: '#56482d', glow: '#e2a05a', seed: 712 },
  tower: { wall: '#282d34', sky: '#394a60', glow: '#b6bbc4', seed: 241 },
};

function randomSource(seed) {
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
function arch(ctx, x, y, width, height) {
  const radius = width / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x, y + radius);
  ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 2);
  ctx.lineTo(x + width, y + height);
  ctx.closePath();
}
function drawShelves(ctx, x, width, random) {
  const bookColors = ['#57543b', '#786347', '#473c31', '#706a51', '#454d3a', '#624734'];
  ctx.fillStyle = '#191c17';
  ctx.fillRect(x - 8, 52, width + 16, 449);
  ctx.fillStyle = '#392f23';
  ctx.fillRect(x, 58, width, 431);
  for (let top = 66; top < 465; top += 69) {
    ctx.fillStyle = '#1c211a';
    ctx.fillRect(x + 9, top, width - 18, 58);
    let cursor = x + 12;
    while (cursor < x + width - 22) {
      const bookWidth = 6 + random() * 10;
      const height = 22 + random() * 30;
      const base = top + 55;
      ctx.fillStyle = bookColors[Math.floor(random() * bookColors.length)];
      ctx.fillRect(cursor, base - height, bookWidth, height);
      ctx.fillStyle = '#bc9d644a';
      ctx.fillRect(cursor + 1, base - height + 5, bookWidth - 2, 1.5);
      ctx.fillRect(cursor + 1, base - 7, bookWidth - 2, 1);
      cursor += bookWidth + 2 + random() * 2;
    }
    ctx.fillStyle = '#564532';
    ctx.fillRect(x + 4, top + 58, width - 8, 3);
  }
}
function drawWindow(ctx, sky, random) {
  arch(ctx, 316, 33, 268, 412);
  ctx.fillStyle = '#141b17';
  ctx.fill();
  ctx.save();
  arch(ctx, 333, 52, 234, 378);
  ctx.clip();
  const glass = ctx.createLinearGradient(0, 50, 0, 430);
  glass.addColorStop(0, sky);
  glass.addColorStop(1, '#121e1c');
  ctx.fillStyle = glass;
  ctx.fillRect(330, 50, 240, 384);
  const moon = ctx.createRadialGradient(483, 158, 4, 483, 158, 85);
  moon.addColorStop(0, '#eeedc275');
  moon.addColorStop(1, '#eeedc200');
  ctx.fillStyle = moon;
  ctx.fillRect(330, 60, 240, 370);
  ctx.fillStyle = '#dddcb1';
  ctx.beginPath();
  ctx.arc(483, 158, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#abc4b645';
  ctx.lineWidth = 1;
  for (let i = 0; i < 100; i++) {
    const x = random() * 250 + 327;
    const y = random() * 395 + 43;
    const length = 6 + random() * 30;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - length * .22, y + length);
    ctx.stroke();
  }
  ctx.fillStyle = '#20281f';
  ctx.fillRect(447, 53, 6, 379);
  ctx.fillRect(333, 255, 234, 7);
  ctx.restore();
}
function drawClock(ctx) {
  ctx.save();
  ctx.translate(450, 249);
  ctx.fillStyle = '#282522';
  ctx.strokeStyle = '#78664a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, 0, 61, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#e0cf9c';
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const theta = i * Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(Math.sin(theta) * 49, Math.cos(theta) * 49);
    ctx.lineTo(Math.sin(theta) * 43, Math.cos(theta) * 43);
    ctx.stroke();
  }
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-8, -36);
  ctx.lineTo(0, 0);
  ctx.lineTo(17, -21);
  ctx.stroke();
  ctx.restore();
}

export function drawLibrary(canvas, room) {
  const ctx = canvas.getContext('2d');
  const { wall, sky, glow, seed } = palette[room];
  const random = randomSource(seed);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#111811';
  ctx.fillRect(0, 473, 900, 147);
  drawWindow(ctx, sky, random);
  drawShelves(ctx, 28, 226, random);
  drawShelves(ctx, 646, 226, random);
  if (room === 'tower') drawClock(ctx);
  const lamp = ctx.createRadialGradient(541, 396, 5, 541, 396, 197);
  lamp.addColorStop(0, glow + '9c');
  lamp.addColorStop(.49, glow + '20');
  lamp.addColorStop(1, glow + '00');
  ctx.fillStyle = lamp;
  ctx.fillRect(220, 169, 640, 450);
  ctx.fillStyle = '#393024';
  ctx.fillRect(258, 482, 383, 22);
  ctx.fillStyle = '#725538';
  ctx.fillRect(243, 466, 417, 17);
  ctx.fillStyle = '#231f19';
  ctx.fillRect(271, 503, 20, 70);
  ctx.fillRect(609, 503, 21, 70);
  ctx.strokeStyle = '#191913';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(543, 459);
  ctx.lineTo(543, 382);
  ctx.stroke();
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.moveTo(521, 368);
  ctx.lineTo(561, 368);
  ctx.lineTo(576, 394);
  ctx.lineTo(506, 394);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#282319';
  ctx.fillRect(518, 455, 49, 7);
  ctx.fillStyle = '#5a3e31';
  ctx.fillRect(334, 447, 72, 13);
  ctx.fillStyle = '#b9a178';
  ctx.fillRect(338, 449, 64, 3);
  const vignette = ctx.createRadialGradient(454, 267, 97, 451, 266, 566);
  vignette.addColorStop(0, '#11151100');
  vignette.addColorStop(1, '#0b120de8');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
