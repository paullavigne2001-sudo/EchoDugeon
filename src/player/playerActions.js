import { COLS, ROWS, WALL, FLOOR, STAIRS, TRAP, TREASURE, MAX_FLOOR } from '../constants.js';
import { applyNoise }          from '../systems/noise.js';
import { revealAt, echoFlood } from '../systems/visibility.js';
import { ENEMY_CONFIG }        from '../enemies/enemyTypes.js';

// ── combat ────────────────────────────────────────────────────────────────────
/**
 * Player attacks enemy at index eidx.
 * Mutates G.enemies, G.player.
 */
export function doCombat(G, eidx, { pushMsg, endGame }) {
  const e = G.enemies[eidx];
  e.hp--;
  applyNoise(G, 50, G.player.x, G.player.y);
  pushMsg(`\u2694 ${ENEMY_CONFIG[e.type].name} attaqu\u00e9`, 'danger');

  if (e.hp <= 0) {
    G.enemies.splice(eidx, 1);
    G.player.score += 20 + G.player.floor * 10;
    pushMsg('Ennemi \u00e9limin\u00e9.', 'good');
  } else {
    G.player.hp--;
    pushMsg('Bless\u00e9 ! \u22121 HP', 'danger');
    if (G.player.hp <= 0) endGame(false);
  }
}

// ── move ──────────────────────────────────────────────────────────────────────
/**
 * Attempt to move player by (dx, dy).
 * Handles wall bumps, tile events (trap / treasure / stairs), and melee.
 * startFloor is passed as callback to avoid circular dependency with floorManager.
 */
export function doMove(G, dx, dy, { pushMsg, endGame, startFloor }) {
  const { player, grid } = G;
  const nx = player.x + dx;
  const ny = player.y + dy;

  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return;

  if (grid[ny][nx] === WALL) {
    applyNoise(G, 5, player.x, player.y);
    return;
  }

  player.x = nx;
  player.y = ny;
  applyNoise(G, 8, nx, ny);
  revealAt(G.vis, nx, ny, 2.5, 0.4, performance.now());

  const tile = grid[ny][nx];

  // ── trap
  if (tile === TRAP) {
    const revealed = G.vis[(ny * COLS + nx) * 2] > 0.3;
    if (!revealed || Math.random() < 0.4) {
      player.hp--;
      applyNoise(G, 40, nx, ny);
      pushMsg('\u26a1 PI\u00c8GE ! \u22121 HP', 'danger');
      if (player.hp <= 0) { grid[ny][nx] = FLOOR; endGame(false); return; }
    } else {
      pushMsg('Pi\u00e8ge \u00e9vit\u00e9.', 'good');
    }
    grid[ny][nx] = FLOOR;
  }

  // ── treasure
  if (tile === TREASURE) {
    const bonus = 40 + (Math.random() * 110 | 0);
    player.score += bonus;
    grid[ny][nx] = FLOOR;
    pushMsg(`\u25c6 Tr\u00e9sor ! +${bonus}`, 'good');
  }

  // ── stairs
  if (tile === STAIRS) {
    const nextFloor = player.floor + 1;
    if (nextFloor > MAX_FLOOR) { endGame(true); return; }
    pushMsg(`\u2193 Descente \u2014 \u00c9tage ${nextFloor}`, 'system');
    const [savedScore, savedHp] = [player.score, player.hp];
    setTimeout(() => startFloor(nextFloor, savedScore, savedHp), 350);
    return;
  }

  // ── enemy collision
  const hitIdx = G.enemies.findIndex(e => e.x === nx && e.y === ny);
  if (hitIdx >= 0) doCombat(G, hitIdx, { pushMsg, endGame });
}

// ── echo ──────────────────────────────────────────────────────────────────────
/**
 * Emit an echolocation pulse from player position.
 * Returns true if an echo was consumed, false if no charges available.
 */
export function doEcho(G, { pushMsg }) {
  if (G.player.echoes <= 0) {
    pushMsg("Pas d'\u00e9cho disponible\u2026", 'soft');
    return false;
  }

  G.player.echoes--;
  const now    = performance.now();
  const radius = 10 + G.player.floor * 1.5;

  echoFlood(G.player.x, G.player.y, G.grid, radius).forEach((op, idx) => {
    const i = idx * 2;
    G.vis[i]   = Math.max(G.vis[i], op);
    G.vis[i+1] = now;
  });

  G.waves.push({ x: G.player.x, y: G.player.y, r: radius, t: now });
  applyNoise(G, 25, G.player.x, G.player.y);
  pushMsg('~ \u00c9cho \u00e9mis ~', 'echo');
  return true;
}
