import { COLS, ROWS, FLOOR, STAIRS, TRAP, TREASURE } from '../constants.js';

/**
 * Generate a procedural dungeon for a given floor.
 * Returns { grid, rooms, start }
 *   grid  — Array[ROWS] of Uint8Array[COLS]
 *   rooms — Array of { x, y, w, h, cx, cy }
 *   start — first room (player spawn)
 */
export function genDungeon(floor) {
  const grid   = Array.from({ length: ROWS }, () => new Uint8Array(COLS));
  const rooms  = [];
  const TARGET = 8 + Math.min(floor * 2, 6);

  for (let t = 0; t < 400 && rooms.length < TARGET; t++) {
    const w = 5 + (Math.random() * 9 | 0);
    const h = 4 + (Math.random() * 7 | 0);
    const x = 2 + (Math.random() * (COLS - w - 4) | 0);
    const y = 2 + (Math.random() * (ROWS - h - 4) | 0);
    if (rooms.some(r =>
      x < r.x+r.w+2 && x+w+2 > r.x &&
      y < r.y+r.h+2 && y+h+2 > r.y)) continue;
    rooms.push({ x, y, w, h, cx: x+(w>>1), cy: y+(h>>1) });
    for (let ry = y; ry < y+h; ry++)
      for (let rx = x; rx < x+w; rx++)
        grid[ry][rx] = FLOOR;
  }

  if (rooms.length < 2) {
    rooms.push(
      { x:3,  y:3,  w:9, h:6, cx:7,  cy:6  },
      { x:30, y:21, w:9, h:6, cx:34, cy:24 },
    );
    for (const r of rooms)
      for (let ry = r.y; ry < r.y+r.h; ry++)
        for (let rx = r.x; rx < r.x+r.w; rx++)
          grid[ry][rx] = FLOOR;
  }

  // L-shaped corridors in MST order
  for (let i = 1; i < rooms.length; i++) {
    let { cx: ax, cy: ay } = rooms[i-1];
    const { cx: bx, cy: by } = rooms[i];
    if (Math.random() < 0.5) {
      for (let rx = Math.min(ax,bx); rx <= Math.max(ax,bx); rx++) grid[ay][rx] = FLOOR;
      for (let ry = Math.min(ay,by); ry <= Math.max(ay,by); ry++) grid[ry][bx] = FLOOR;
    } else {
      for (let ry = Math.min(ay,by); ry <= Math.max(ay,by); ry++) grid[ry][ax] = FLOOR;
      for (let rx = Math.min(ax,bx); rx <= Math.max(ax,bx); rx++) grid[by][rx] = FLOOR;
    }
  }

  const last = rooms[rooms.length - 1];
  grid[last.cy][last.cx] = STAIRS;

  for (let i = 0; i < 2 + floor * 2; i++) {
    const r  = rooms[1 + (Math.random() * (rooms.length - 1) | 0)];
    const tx = r.x + 1 + (Math.random() * Math.max(1, r.w - 2) | 0);
    const ty = r.y + 1 + (Math.random() * Math.max(1, r.h - 2) | 0);
    if (ty > 0 && ty < ROWS && tx > 0 && tx < COLS && grid[ty][tx] === FLOOR)
      grid[ty][tx] = TRAP;
  }

  for (let i = 0; i < 2 + floor; i++) {
    const r  = rooms[Math.random() * rooms.length | 0];
    const tx = r.x + (Math.random() * r.w | 0);
    const ty = r.y + (Math.random() * r.h | 0);
    if (ty > 0 && ty < ROWS && tx > 0 && tx < COLS && grid[ty][tx] === FLOOR)
      grid[ty][tx] = TREASURE;
  }

  return { grid, rooms, start: rooms[0] };
}
