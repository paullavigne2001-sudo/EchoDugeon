# Echo Dungeon — Architecture

## Stack
React 18 + canvas 2D. Aucune dépendance externe.

## Structure

```
echo-dungeon/
├── constants.js          # Toutes les valeurs magiques et énumérations
├── EchoDungeon.jsx       # Composant racine — hooks, game loop, câblage
│
├── systems/
│   ├── dungeon.js        # Génération procédurale (rooms, corridors, items)
│   ├── visibility.js     # echoFlood (BFS) + revealAt (ambiant)
│   ├── noise.js          # applyNoise — propagation bruit + alerte ennemis
│   └── pathfinding.js    # nextStep — BFS avec parent pointers
│
├── enemies/
│   ├── enemyTypes.js     # Config statique par archétype (nom, couleur, portée)
│   └── enemyAI.js        # spawnEnemies + runAiTick (PATROL/ALERT/CHASE)
│
├── player/
│   ├── playerState.js    # createPlayer — factory objet joueur
│   └── playerActions.js  # doMove, doEcho, doCombat
│
├── levels/
│   └── floorManager.js   # buildFloor — assemble l'état G complet
│
├── effects/
│   └── renderer.js       # renderFrame(ctx, G, now) — rendu canvas pur
│
└── ui/
    ├── HUD.jsx            # Barre HP / écho / bruit / étage / score
    ├── DPad.jsx           # D-pad tactile mobile
    └── screens.jsx        # MenuScreen + GameOverScreen
```

## État de jeu (objet G)

```js
G = {
  grid:    Array[ROWS] of Uint8Array[COLS],  // tuiles
  rooms:   [{ x, y, w, h, cx, cy }],
  enemies: [{ id, x, y, type, hp, state, alert, ntgt, pt }],
  vis:     Float32Array[ROWS*COLS*2],        // [opacity, timestamp] par tuile
  waves:   [{ x, y, r, t }],                // animations écho
  rings:   [{ x, y, lvl, t }],              // animations bruit
  player:  { x, y, hp, maxHp, echoes, noise, score, floor },
}
```

## Conventions

- **G est muté directement** par les systèmes (pas de copie).  
- **React state** ne contient que les valeurs d'affichage (HP, score...).  
- **Callbacks** (pushMsg, endGame, startFloor) sont injectés depuis EchoDungeon.jsx.  
- Les fonctions dans `systems/` et `player/` sont **pures** (pas d'import React).

## Système de visibilité

`vis[i*2]`   = opacité de base au moment du reveal (0–1)  
`vis[i*2+1]` = timestamp du dernier reveal (ms)

Opacité affichée = `baseOp × max(0, 1 − (age − FADE_HOLD) / FADE_DUR)`

## Pour lancer

```bash
npm create vite@latest . -- --template react
# copier les fichiers
npm install && npm run dev
```
