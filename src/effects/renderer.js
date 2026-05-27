import {
  COLS, ROWS, CS, CW, CH,
  WALL, STAIRS, TRAP, TREASURE,
  PATROL, CHASE,
  FADE_HOLD, FADE_DUR,
} from '../constants.js';
import { ENEMY_CONFIG } from '../enemies/enemyTypes.js';

const AMBIENT_RADIUS  = 1.5;
const AMBIENT_OPACITY = 0.22;

export function renderFrame(ctx, G, now) {
  const { grid, player, enemies, vis, waves, rings } = G;

  // ── noise decay
  G.player.noise = Math.max(0, G.player.noise * 0.976);

  // ── lueur permanente autour du joueur (reset du timer chaque frame)
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const nx = player.x + dx, ny = player.y + dy;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d > AMBIENT_RADIUS) continue;
      const op = AMBIENT_OPACITY * (1 - d / (AMBIENT_RADIUS + 0.5));
      const i  = (ny * COLS + nx) * 2;
      vis[i]   = Math.max(vis[i], op);
      vis[i+1] = now;
    }
  }

  // ── background
  ctx.fillStyle = '#010008';
  ctx.fillRect(0, 0, CW, CH);

  // ── tiles
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const i   = (y * COLS + x) * 2;
      const bop = vis[i];
      if (bop < 0.015) continue;

      const age = now - vis[i + 1];
      const fp  = Math.max(0, (age - FADE_HOLD) / FADE_DUR);
      const op  = bop * Math.max(0, 1 - fp);
      if (op < 0.01) continue;

      const tile = grid[y][x];
      const px   = x * CS, py = y * CS;
      const a    = Math.min(1, op);

      if (tile === WALL) {
        ctx.fillStyle   = `rgba(22,15,50,${a})`;
        ctx.fillRect(px, py, CS, CS);
        ctx.strokeStyle = `rgba(48,32,100,${a * 0.5})`;
        ctx.lineWidth   = 0.5;
        ctx.strokeRect(px + 0.5, py + 0.5, CS - 1, CS - 1);
      } else {
        ctx.fillStyle = `rgba(6,4,14,${a})`;
        ctx.fillRect(px, py, CS, CS);

        if (tile === STAIRS && a > 0.15) {
          ctx.fillStyle   = `rgba(0,190,160,${a})`;
          ctx.fillRect(px + 3, py + 3, CS - 6, CS - 6);
          ctx.strokeStyle = `rgba(0,230,195,${a})`;
          ctx.lineWidth   = 1;
          ctx.strokeRect(px + 2.5, py + 2.5, CS - 5, CS - 5);

        } else if (tile === TREASURE && a > 0.15) {
          ctx.fillStyle = `rgba(255,182,0,${a})`;
          ctx.beginPath();
          ctx.arc(px + CS/2, py + CS/2, CS/2 - 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255,230,90,${a * 0.5})`;
          ctx.beginPath();
          ctx.arc(px + CS/2 - 1, py + CS/2 - 1, CS/2 - 5, 0, Math.PI * 2);
          ctx.fill();

        } else if (tile === TRAP) {
          ctx.fillStyle = `rgba(140,0,0,${a * 0.4})`;
          ctx.fillRect(px + 2, py + 2, CS - 4, CS - 4);
          if (a > 0.3) {
            ctx.strokeStyle = `rgba(210,0,0,${a * 0.7})`;
            ctx.lineWidth   = 1;
            ctx.beginPath();
            ctx.moveTo(px + 3,    py + 3);
            ctx.lineTo(px + CS-3, py + CS-3);
            ctx.moveTo(px + CS-3, py + 3);
            ctx.lineTo(px + 3,    py + CS-3);
            ctx.stroke();
          }
        }
      }
    }
  }

  // ── noise rings
  G.rings = rings.filter(n => {
    const age = now - n.t;
    if (age > 1600) return false;
    const t = age / 1600;
    ctx.beginPath();
    ctx.arc(n.x * CS + CS/2, n.y * CS + CS/2, t * n.lvl * CS * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,80,20,${(1 - t) * 0.22})`;
    ctx.lineWidth   = 1;
    ctx.stroke();
    return true;
  });

  // ── echo waves
  G.waves = waves.filter(w => {
    const age = now - w.t, dur = 700;
    if (age > dur) return false;
    const t  = age / dur;
    const R  = t * w.r * CS;
    const al = (1 - t) * 0.78;

    ctx.beginPath();
    ctx.arc(w.x * CS + CS/2, w.y * CS + CS/2, R, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,222,192,${al})`;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    if (t > 0.12) {
      ctx.beginPath();
      ctx.arc(w.x * CS + CS/2, w.y * CS + CS/2, (t - 0.12) * w.r * CS, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,145,125,${al * 0.35})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
    }
    return true;
  });

  // ── enemies
  enemies.forEach(e => {
    const vi  = (e.y * COLS + e.x) * 2;
    const bop = vis[vi];
    if (bop < 0.08) return;

    const age2 = now - vis[vi + 1];
    const fp2  = Math.max(0, (age2 - FADE_HOLD) / FADE_DUR);
    const a    = Math.min(0.95, bop * Math.max(0, 1 - fp2));
    if (a < 0.08) return;

    const ex = e.x * CS + CS/2;
    const ey = e.y * CS + CS/2;
    const [r, g, b] = ENEMY_CONFIG[e.type].color;

    const grd = ctx.createRadialGradient(ex, ey, 0, ex, ey, CS * 1.8);
    grd.addColorStop(0, `rgba(${r},${g},${b},${a * 0.38})`);
    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(ex, ey, CS * 1.8, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.beginPath(); ctx.arc(ex, ey, CS/2 - 1, 0, Math.PI * 2); ctx.fill();

    if (e.state !== PATROL && a > 0.25) {
      ctx.fillStyle  = `rgba(255,242,0,${a})`;
      ctx.font       = `bold ${CS - 4}px monospace`;
      ctx.textAlign  = 'center';
      ctx.fillText(e.state === CHASE ? '!!' : '!', ex, ey - CS/2 - 2);
    }
  });

  // ── vignette AVANT le joueur pour qu'il soit toujours visible
  const vg = ctx.createRadialGradient(CW/2, CH/2, CH * 0.1, CW/2, CH/2, CH * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,8,0.92)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, CW, CH);

  // ── joueur — dessiné EN DERNIER, toujours au-dessus de tout
  const ppx     = player.x * CS + CS/2;
  const ppy     = player.y * CS + CS/2;
  const flicker = player.hp <= 1 ? (0.7 + 0.3 * Math.sin(now * 0.02)) : 1;

  // halo ambiant
  const pg = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, CS * 3.5);
  pg.addColorStop(0, `rgba(150,195,255,${0.2 * flicker})`);
  pg.addColorStop(0.4, `rgba(100,150,220,${0.08 * flicker})`);
  pg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.arc(ppx, ppy, CS * 3.5, 0, Math.PI * 2); ctx.fill();

  // corps blanc-bleu
  ctx.fillStyle   = `rgba(200,225,255,${flicker})`;
  ctx.beginPath(); ctx.arc(ppx, ppy, CS/2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `rgba(255,255,255,${flicker})`;
  ctx.lineWidth   = 2;
  ctx.stroke();

  // point central
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(ppx, ppy, 2.5, 0, Math.PI * 2); ctx.fill();

  ctx.textAlign = 'left';
}
