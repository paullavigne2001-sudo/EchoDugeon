import { COLS, ROWS, FLOOR, WALL, PATROL, ALERT, CHASE, GHOST } from '../constants.js';
import { nextStep }    from '../systems/pathfinding.js';
import { applyNoise }  from '../systems/noise.js';
import { ENEMY_CONFIG } from './enemyTypes.js';

/**
 * Spawn enemies for a floor.
 * Skips positions too close to the player start or off valid floor tiles.
 */
export function spawnEnemies(rooms, grid, start, floor) {
  const list = [];
  const n    = Math.min(3 + floor * 2, 10);

  for (let i = 0; i < n; i++) {
    const r  = rooms[(2 + i) % rooms.length];
    const ex = r.x + 1 + (Math.random() * Math.max(1, r.w - 2) | 0);
    const ey = r.y + 1 + (Math.random() * Math.max(1, r.h - 2) | 0);
    if (ey < 1 || ey >= ROWS-1 || ex < 1 || ex >= COLS-1) continue;
    if (grid[ey][ex] !== FLOOR) continue;
    if (Math.abs(ex - start.cx) + Math.abs(ey - start.cy) < 10) continue;

    const type = i % 3;
    list.push({
      id:    i,
      x:     ex,
      y:     ey,
      type,
      hp:    ENEMY_CONFIG[type].hp,
      state: PATROL,
      alert: 0,
      ntgt:  null,   // noise target {x, y}
      pt:    0,      // patrol tick counter
    });
  }
  return list;
}

/**
 * Run one AI tick for every enemy.
 * Mutates enemies and player directly.
 * Calls callbacks.pushMsg / callbacks.endGame as side-effects.
 */
export function runAiTick(G, { pushMsg, endGame }) {
  const { player, enemies, grid } = G;

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];

    // alert decay
    e.alert = Math.max(0, e.alert - 5);
    if (e.alert === 0 && e.state !== PATROL) { e.state = PATROL; e.ntgt = null; }

    const dist = Math.abs(e.x - player.x) + Math.abs(e.y - player.y);

    // ── melee attack when adjacent
    if (dist === 1) {
      player.hp--;
      applyNoise(G, 30, e.x, e.y);
      pushMsg(`\u{1F480} ${ENEMY_CONFIG[e.type].name} attaque !`, 'danger');
      if (player.hp <= 0) { endGame(false); return; }
    }

    // ── ghost: drain echo charge at close range
    if (e.type === GHOST && dist < 5 && Math.random() < 0.07 && player.echoes > 0) {
      player.echoes--;
      pushMsg('Fantôme draine votre écho !', 'danger');
    }

    // ── movement
    if (e.state === CHASE || e.state === ALERT) {
      const tgt = e.state === CHASE
        ? { x: player.x, y: player.y }
        : (e.ntgt ?? { x: player.x, y: player.y });

      if (e.x !== tgt.x || e.y !== tgt.y) {
        const step = nextStep(grid, e.x, e.y, tgt.x, tgt.y);
        if (step) {
          const [nx, ny] = step;
          const occupied = enemies.some(o => o.id !== e.id && o.x === nx && o.y === ny);
          const onPlayer = nx === player.x && ny === player.y;
          if (!occupied && !onPlayer) { e.x = nx; e.y = ny; }
        }
      } else if (e.state === ALERT) {
        e.state = PATROL;   // arrived at noise source, resume patrol
      }

    } else {
      // ── patrol: random walk every 3 ticks
      e.pt++;
      if (e.pt >= 3) {
        e.pt = 0;
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]].sort(() => Math.random() - 0.5);
        for (const [ddx, ddy] of dirs) {
          const nx = e.x + ddx, ny = e.y + ddy;
          if (nx < 1 || nx >= COLS-1 || ny < 1 || ny >= ROWS-1) continue;
          if (grid[ny][nx] === WALL) continue;
          if (enemies.some(o => o.id !== e.id && o.x === nx && o.y === ny)) continue;
          if (nx === player.x && ny === player.y) continue;
          e.x = nx; e.y = ny; break;
        }
      }
    }
  }
}
