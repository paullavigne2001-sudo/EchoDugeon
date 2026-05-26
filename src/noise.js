import { LURKER, GHOST, PATROL, ALERT, CHASE } from '../constants.js';

const hearingRange = (type) => type === LURKER ? 9 : type === GHOST ? 18 : 12;

/**
 * Apply a noise event at world position (x, y) with given level.
 * Mutates G.player.noise, pushes a visual ring, and alerts nearby enemies.
 *
 * @param {object} G    - full game-state object
 * @param {number} lvl  - noise intensity (0–100 scale)
 * @param {number} x    - world X of noise source
 * @param {number} y    - world Y of noise source
 */
export function applyNoise(G, lvl, x, y) {
  G.player.noise = Math.min(100, G.player.noise + lvl);
  G.rings.push({ x, y, lvl, t: performance.now() });

  G.enemies.forEach(e => {
    const dist  = Math.abs(e.x - x) + Math.abs(e.y - y);
    const range = hearingRange(e.type);
    if (dist > range) return;

    e.alert = Math.min(100, e.alert + lvl * (1 - dist / range));

    if (e.alert > 25 && e.state === PATROL) {
      e.state = ALERT;
      e.ntgt  = { x, y };
    }
    if (e.alert > 60) e.state = CHASE;
  });
}
