/**
 * Web Audio API — tous les sons sont synthétisés, aucun fichier externe.
 * AudioContext créé au premier appel (contourne la politique autoplay).
 */

let AC = null;

function ctx() {
  if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
  if (AC.state === 'suspended') AC.resume();
  return AC;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function osc(type, freq, t, dur, peak) {
  const c = ctx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t); o.stop(t + dur + 0.02);
}

function freqRamp(type, f0, f1, t, dur, peak) {
  const c = ctx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t); o.stop(t + dur + 0.02);
}

function whiteNoise(t, dur, peak, filterHz) {
  const c = ctx();
  const size = c.sampleRate * dur;
  const buf  = c.createBuffer(1, size, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buf;

  const flt = c.createBiquadFilter();
  flt.type = 'bandpass';
  flt.frequency.value = filterHz;
  flt.Q.value = 1.5;

  const g = c.createGain();
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);

  src.connect(flt); flt.connect(g); g.connect(c.destination);
  src.start(t); src.stop(t + dur);
}

// ── public API ────────────────────────────────────────────────────────────────

/** Ping sonar — émission d'écho */
export function playEcho() {
  const t = ctx().currentTime;
  freqRamp('sine', 900, 180, t, 0.9, 0.28);
  osc('sine', 450, t, 0.5, 0.08);
}

/** Pas feutré du joueur */
export function playStep() {
  const t = ctx().currentTime;
  freqRamp('sine', 110, 38, t, 0.08, 0.14);
}

/** Coup sourd contre un mur */
export function playBump() {
  whiteNoise(ctx().currentTime, 0.06, 0.18, 350);
}

/** Attaque du joueur */
export function playAttack() {
  const t = ctx().currentTime;
  osc('sawtooth', 220, t, 0.12, 0.28);
  osc('square',   110, t + 0.05, 0.1, 0.18);
}

/** Joueur blessé */
export function playHurt() {
  const t = ctx().currentTime;
  freqRamp('sawtooth', 320, 80, t, 0.25, 0.38);
  osc('sine', 160, t, 0.3, 0.16);
}

/** Piège déclenché — décharge électrique */
export function playTrap() {
  const t = ctx().currentTime;
  whiteNoise(t, 0.12, 0.5, 3200);
  osc('square', 640, t, 0.1, 0.28);
}

/** Trésor ramassé — carillon ascendant */
export function playTreasure() {
  const t = ctx().currentTime;
  [523, 659, 784, 1047].forEach((f, i) => osc('sine', f, t + i * 0.09, 0.35, 0.18));
}

/** Ennemi alerte — ton montant */
export function playAlert() {
  const t = ctx().currentTime;
  freqRamp('square', 180, 380, t, 0.22, 0.09);
}

/** Descente d'escalier — swoosh grave */
export function playStairs() {
  const t = ctx().currentTime;
  freqRamp('sine', 580, 95, t, 0.55, 0.2);
}

/** Mort du joueur — drone descendant */
export function playDeath() {
  const t = ctx().currentTime;
  freqRamp('sawtooth', 90, 18, t, 2.2, 0.42);
  osc('sine', 45, t, 2.2, 0.22);
}

/** Fantôme draine un écho — glissement spectral */
export function playGhostDrain() {
  const t = ctx().currentTime;
  freqRamp('sine', 640, 160, t, 0.45, 0.14);
  freqRamp('sine', 320,  80, t + 0.12, 0.4, 0.09);
}

/** Appeler au premier geste utilisateur pour débloquer l'AudioContext */
export function initAudio() {
  ctx();
}
