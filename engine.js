/**
 * engine.js — Afterlight procedural audio engine
 *
 * Exports createMixer(), which returns:
 *   start()                  — resume/create AudioContext, begin synthesis
 *   pause()                  — fade to silence and suspend the context
 *   setLevels({rain,wind,clock}) — ramp individual channel gains (0–1)
 *   setMaster(value)         — ramp master gain (0–1)
 *
 * All synthesis is procedural (Web Audio API only, no assets, no network).
 * Gain changes ramp over RAMP_S seconds so there are no clicks.
 */

export function createMixer() {
  // ── constants ────────────────────────────────────────────────────────────
  const RAMP_S       = 0.04;   // gain ramp duration in seconds
  const MASTER_SCALE = 0.28;   // scale applied on top of user master (keeps output comfortable)

  // ── state ────────────────────────────────────────────────────────────────
  let ctx        = null;   // AudioContext, created lazily on first start()
  let masterGain = null;
  let rainGain   = null;
  let windGain   = null;
  let clockGain  = null;
  let active     = false;

  // Desired levels (held so we can re-apply after resume)
  let levels = { rain: 0.65, wind: 0.24, clock: 0.30 };
  let master = 0.36;

  // ── helpers ───────────────────────────────────────────────────────────────

  /** Ramp a gain node to `value` without clicks. */
  function rampTo(gainNode, value, when = null) {
    if (!gainNode) return;
    const t = when ?? ctx.currentTime;
    gainNode.gain.cancelScheduledValues(t);
    gainNode.gain.setValueAtTime(gainNode.gain.value, t);
    gainNode.gain.linearRampToValueAtTime(value, t + RAMP_S);
  }

  /**
   * Build a looping white-noise source and the gain node for its channel.
   */
  function buildNoiseTrack(gainValue) {
    // Two seconds of white-noise PCM (looped, so length just sets granularity)
    const bufferLen = ctx.sampleRate * 2;
    const buffer    = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
    const data      = buffer.getChannelData(0);
    for (let i = 0; i < bufferLen; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop   = true;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainValue, ctx.currentTime);

    return { source, gain };
  }

  // ── synthesis builders ────────────────────────────────────────────────────

  /**
   * Rain bed: white noise → lowpass 900 Hz → bandpass 1 200 Hz Q 1.8
   * The bandpass adds a glassy resonance characteristic of rain on a window
   * while the lowpass removes harsh high-frequency hiss.
   */
  function buildRain() {
    const { source, gain } = buildNoiseTrack(levels.rain);

    const lp = ctx.createBiquadFilter();
    lp.type            = 'lowpass';
    lp.frequency.value = 900;
    lp.Q.value         = 0.5;

    const bp = ctx.createBiquadFilter();
    bp.type            = 'bandpass';
    bp.frequency.value = 1200;
    bp.Q.value         = 1.8;

    source.connect(lp);
    lp.connect(bp);
    bp.connect(gain);
    gain.connect(masterGain);

    source.start();
    rainGain = gain;
  }

  /**
   * Wind: white noise → lowpass 220 Hz → lowpass 110 Hz (double softens it)
   * → bandpass 180 Hz Q 0.6 (adds a low hollow moan).
   */
  function buildWind() {
    const { source, gain } = buildNoiseTrack(levels.wind);

    const lp1 = ctx.createBiquadFilter();
    lp1.type            = 'lowpass';
    lp1.frequency.value = 220;
    lp1.Q.value         = 0.3;

    const lp2 = ctx.createBiquadFilter();
    lp2.type            = 'lowpass';
    lp2.frequency.value = 110;
    lp2.Q.value         = 0.3;

    const bp = ctx.createBiquadFilter();
    bp.type            = 'bandpass';
    bp.frequency.value = 180;
    bp.Q.value         = 0.6;

    source.connect(lp1);
    lp1.connect(lp2);
    lp2.connect(bp);
    bp.connect(gain);
    gain.connect(masterGain);

    source.start();
    windGain = gain;
  }

  /**
   * A short, soft tick in a one-second loop. Scheduling it in the audio
   * graph keeps the time stable when Chrome throttles background tabs.
   */
  function buildClock() {
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const tick = buffer.getChannelData(0);
    const tickLength = Math.floor(ctx.sampleRate * 0.06);

    for (let i = 0; i < tickLength; i++) {
      const seconds = i / ctx.sampleRate;
      const envelope = Math.min(seconds / 0.003, 1) * Math.exp(-seconds * 100);
      tick[i] = Math.sin(seconds * Math.PI * 2 * 1500) * envelope * 0.36;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    clockGain = ctx.createGain();
    clockGain.gain.value = levels.clock;
    source.connect(clockGain);
    clockGain.connect(masterGain);
    source.start();
  }

  async function start() {
    if (!ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Web Audio is unavailable');
      ctx = new AudioContextClass();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(ctx.destination);
      buildRain();
      buildWind();
      buildClock();
    }

    await ctx.resume();
    active = true;
    rampTo(masterGain, master * MASTER_SCALE);
  }

  async function pause() {
    if (!active) return;
    active = false;
    rampTo(masterGain, 0);
    await new Promise(resolve => setTimeout(resolve, (RAMP_S + 0.02) * 1000));
    await ctx.suspend();
  }

  function setLevels({ rain, wind, clock }) {
    if (typeof rain  === 'number') { levels.rain  = rain;  rampTo(rainGain,  rain);  }
    if (typeof wind  === 'number') { levels.wind  = wind;  rampTo(windGain,  wind);  }
    if (typeof clock === 'number') { levels.clock = clock; rampTo(clockGain, clock); }
  }

  function setMaster(value) {
    master = value;
    if (active) rampTo(masterGain, master * MASTER_SCALE);
  }

  return { start, pause, setLevels, setMaster };
}
