import { COLS, ROWS } from '../constants.js';
import { genDungeon }   from '../systems/dungeon.js';
import { spawnEnemies } from '../enemies/enemyAI.js';
import { createPlayer } from '../player/playerState.js';

/**
 * Build a complete game-state object for the given floor.
 * Returns the canonical G object used throughout the game.
 *
 * G shape:
 *   grid    — Array[ROWS] of Uint8Array[COLS]  (tile types)
 *   rooms   — room descriptors
 *   enemies — mutable enemy array
 *   vis     — Float32Array[ROWS*COLS*2]  [opacity, timestamp] per tile
 *   waves   — active echo wave animations  [{ x, y, r, t }]
 *   rings   — active noise ring animations [{ x, y, lvl, t }]
 *   player  — mutable player object
 */
export function buildFloor(floor, score = 0, hp = 5) {
  const { grid, rooms, start } = genDungeon(floor);
  const enemies = spawnEnemies(rooms, grid, start, floor);
  const vis     = new Float32Array(ROWS * COLS * 2);
  const player  = createPlayer(start.cx, start.cy, hp, score, floor);
  const now     = performance.now();

  // reveal a small area around the player start
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const nx = start.cx + dx, ny = start.cy + dy;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d > 3.5) continue;
      const i = (ny * COLS + nx) * 2;
      vis[i]   = Math.max(vis[i], 0.45 * (1 - d / 4));
      vis[i+1] = now;
    }
  }

  return { grid, rooms, enemies, vis, waves: [], rings: [], player };
}
