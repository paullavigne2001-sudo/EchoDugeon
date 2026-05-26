import { COLS, ROWS, WALL } from '../constants.js';

/**
 * BFS flood-fill from (px, py), blocked by walls.
 * Returns Map<tileIndex, opacity> — opacity proportional to inverse distance.
 */
export function echoFlood(px, py, grid, radius) {
  const res = new Map();
  const vis = new Uint8Array(ROWS * COLS);
  const q   = [[px, py, 0]];
  vis[py * COLS + px] = 1;

  while (q.length) {
    const [x, y, d] = q.shift();
    if (d > radius) continue;
    res.set(y * COLS + x, Math.max(0.07, 1 - (d / radius) * 0.93));
    if (grid[y][x] === WALL) continue;          // walls block propagation
    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]) {
      const nx = x+dx, ny = y+dy;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
      const ni = ny * COLS + nx;
      if (vis[ni]) continue;
      const nd = d + (dx && dy ? 1.414 : 1);
      if (nd > radius) continue;
      vis[ni] = 1;
      q.push([nx, ny, nd]);
    }
  }
  return res;
}

/**
 * Reveal tiles in a circular area around (cx, cy).
 * visArr — Float32Array with interleaved [opacity, timestamp] per tile (2 floats/tile).
 * Only brightens: takes max of existing vs new opacity.
 * Always resets the fade timer on hit tiles.
 */
export function revealAt(visArr, cx, cy, r, base, now) {
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d > r) continue;
      const op = base * (1 - d / (r + 0.5));
      const i  = (ny * COLS + nx) * 2;
      visArr[i]   = Math.max(visArr[i], op);
      visArr[i+1] = now;
    }
  }
}
