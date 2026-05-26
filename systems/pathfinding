import { COLS, ROWS, WALL } from '../constants.js';

/**
 * BFS with parent-pointer reconstruction.
 * Returns the first [x, y] step from (sx,sy) toward (tx,ty),
 * or null if (tx,ty) is unreachable.
 *
 * Memory-efficient: O(ROWS*COLS) with Int16Array parent array.
 * Time: O(ROWS*COLS) worst-case per call.
 */
export function nextStep(grid, sx, sy, tx, ty) {
  if (sx === tx && sy === ty) return null;

  const par = new Int16Array(ROWS * COLS).fill(-1);
  const si  = sy * COLS + sx;
  par[si]   = si;                   // start is its own parent (sentinel)
  const q   = [si];

  while (q.length) {
    const idx = q.shift();
    const x   = idx % COLS;
    const y   = idx / COLS | 0;

    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
      const ni = ny * COLS + nx;
      if (par[ni] !== -1 || grid[ny][nx] === WALL) continue;
      par[ni] = idx;

      if (nx === tx && ny === ty) {
        // trace back to the first step from start
        let cur = ni;
        while (par[cur] !== si) cur = par[cur];
        return [cur % COLS, cur / COLS | 0];
      }
      q.push(ni);
    }
  }
  return null;   // no path found
}
