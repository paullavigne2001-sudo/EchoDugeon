import { STALKER, LURKER, GHOST } from '../constants.js';

/**
 * Static configuration for each enemy archetype.
 *   name        — display name (French)
 *   color       — [r, g, b] for canvas rendering
 *   noiseRange  — tile radius for hearing noise events
 *   hp          — starting hit points
 *   description — player-facing flavour text
 */
export const ENEMY_CONFIG = {
  [STALKER]: {
    name:        'Traqueur',
    color:       [220, 42,  42],
    noiseRange:  12,
    hp:          2,
    description: 'Suit le bruit. Agressif en approche.',
  },
  [LURKER]: {
    name:        'Rôdeur',
    color:       [220, 118,  0],
    noiseRange:  9,
    hp:          2,
    description: 'Embuscade silencieuse. Portée courte, réaction rapide.',
  },
  [GHOST]: {
    name:        'Fantôme',
    color:       [100,  82, 242],
    noiseRange:  18,
    hp:          1,
    description: 'Entend tout. Draine vos charges d\'écho au contact.',
  },
};
