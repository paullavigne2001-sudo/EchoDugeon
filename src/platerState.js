import { MAX_ECHOES } from '../constants.js';

/**
 * Factory for a fresh player object.
 * All mutable fields live here; the game loop mutates them directly.
 */
export function createPlayer(x, y, hp = 5, score = 0, floor = 1) {
  return {
    x,
    y,
    hp,
    maxHp:  5,
    echoes: MAX_ECHOES,
    noise:  0,         // current noise level (0–100), decays each frame
    score,
    floor,
  };
}
