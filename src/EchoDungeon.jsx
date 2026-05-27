import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CW, CH, MAX_ECHOES, ECHO_REGEN, ENEMY_SPEED, MOVE_CD,
  MENU, PLAY, DEAD, WIN,
} from './constants.js';
import { buildFloor }                 from './levels/floorManager.js';
import { runAiTick }                  from './enemies/enemyAI.js';
import { doMove, doEcho }             from './player/playerActions.js';
import { renderFrame }                from './effects/renderer.js';
import { initAudio }                  from './systems/audio.js';
import { HUD }                        from './ui/HUD.jsx';
import { DPad }                       from './ui/DPad.jsx';
import { MenuScreen, GameOverScreen } from './ui/screens.jsx';

const FONT = "'Courier New', Courier, monospace";

export default function EchoDungeon() {
  const cvs    = useRef(null);
  const G      = useRef(null);
  const phase  = useRef(MENU);
  const raf    = useRef(null);
  const TS     = useRef({ enemy: 0, echo: 0, move: 0 });
  const msgBuf = useRef([]);

  const [ui, setUi] = useState({
    phase: MENU,
    hp: 5, echoes: MAX_ECHOES,
    noise: 0, score: 0, floor: 1,
    msgs: [],
  });

  const syncUi = useCallback(() => {
    if (!G.current) return;
    const p = G.current.player;
    setUi(s => ({
      ...s,
      hp:     p.hp,
      echoes: p.echoes,
      noise:  Math.round(p.noise),
      score:  p.score,
      floor:  p.floor,
      msgs:   [...msgBuf.current],
    }));
  }, []);

  const pushMsg = useCallback((text, type = 'info') => {
    msgBuf.current = [
      ...msgBuf.current.slice(-4),
      { text, type, id: Date.now() + Math.random() },
    ];
  }, []);

  const endGame = useCallback((win) => {
    phase.current = win ? WIN : DEAD;
    cancelAnimationFrame(raf.current);
    setUi(s => ({
      ...s,
      phase: phase.current,
      score: G.current?.player.score ?? s.score,
    }));
  }, []);

  const startFloor = useCallback((floor, score = 0, hp = 5) => {
    G.current     = buildFloor(floor, score, hp);
    phase.current = PLAY;
    msgBuf.current = [{
      text: `\u00c9tage ${floor} \u2014 L'obscurit\u00e9 vous enveloppe.`,
      type: 'system',
      id:   Date.now(),
    }];
    const now = performance.now();
    TS.current = { enemy: now, echo: now, move: 0 };
    setUi({ phase: PLAY, hp, echoes: MAX_ECHOES, noise: 0, score, floor, msgs: [...msgBuf.current] });
  }, []);

  const handleMove = useCallback((dx, dy) => {
    if (!G.current || phase.current !== PLAY) return;
    const now = performance.now();
    if (now - TS.current.move < MOVE_CD) return;
    TS.current.move = now;
    doMove(G.current, dx, dy, { pushMsg, endGame, startFloor });
    syncUi();
  }, [pushMsg, endGame, startFloor, syncUi]);

  const handleEcho = useCallback(() => {
    if (!G.current || phase.current !== PLAY) return;
    const used = doEcho(G.current, { pushMsg });
    if (used) TS.current.echo = performance.now();
    syncUi();
  }, [pushMsg, syncUi]);

  // ── game loop
  const loop = useCallback((now) => {
    if (phase.current !== PLAY) return;
    const ts = TS.current;

    if (now - ts.enemy > ENEMY_SPEED) {
      ts.enemy = now;
      runAiTick(G.current, { pushMsg, endGame });
    }

    if (G.current?.player.echoes < MAX_ECHOES && now - ts.echo > ECHO_REGEN) {
      ts.echo = now;
      G.current.player.echoes = Math.min(MAX_ECHOES, G.current.player.echoes + 1);
      setUi(s => ({ ...s, echoes: G.current.player.echoes }));
    }

    const canvas = cvs.current;
    if (canvas) renderFrame(canvas.getContext('2d'), G.current, now);

    raf.current = requestAnimationFrame(loop);
  }, [pushMsg, endGame]);

  useEffect(() => {
    if (ui.phase === PLAY) raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [ui.phase, loop]);

  // keyboard
  useEffect(() => {
    if (ui.phase !== PLAY) return;
    const onKey = (e) => {
      switch (e.key) {
        case 'ArrowUp':    case 'w': case 'z': e.preventDefault(); handleMove( 0, -1); break;
        case 'ArrowDown':  case 's':           e.preventDefault(); handleMove( 0,  1); break;
        case 'ArrowLeft':  case 'a': case 'q': e.preventDefault(); handleMove(-1,  0); break;
        case 'ArrowRight': case 'd':           e.preventDefault(); handleMove( 1,  0); break;
        case ' ':          case 'e': case 'E': e.preventDefault(); handleEcho();       break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ui.phase, handleMove, handleEcho]);

  const { phase: ph, hp, echoes, noise, score, floor, msgs } = ui;

  // ── débloquer AudioContext au premier clic (politique autoplay)
  const handleStart = () => { initAudio(); startFloor(1); };

  if (ph === MENU) return <MenuScreen onStart={handleStart} />;
  if (ph === DEAD || ph === WIN)
    return <GameOverScreen win={ph === WIN} score={score} onRestart={handleStart} />;

  return (
    <div style={{
      background: '#010008', fontFamily: FONT,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      userSelect: 'none', WebkitUserSelect: 'none',
    }}>

      <HUD hp={hp} echoes={echoes} noise={noise} score={score} floor={floor} />

      <div style={{ position: 'relative', lineHeight: 0 }}>
        <canvas
          ref={cvs} width={CW} height={CH}
          style={{ display: 'block', imageRendering: 'pixelated' }}
        />
        {/* CRT scanlines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,0,0,.08) 1px,rgba(0,0,0,.08) 2px)',
        }} />
        {/* message log */}
        <div style={{
          position: 'absolute', bottom: 10, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', gap: 3,
          alignItems: 'center', pointerEvents: 'none',
        }}>
          {msgs.slice(-3).map((m, i) => (
            <div key={m.id} style={{
              fontSize: 9, letterSpacing: 2, whiteSpace: 'nowrap',
              color: m.type === 'danger' ? '#ff3333'
                   : m.type === 'good'   ? '#33cc66'
                   : m.type === 'echo'   ? '#00ddb5'
                   : m.type === 'system' ? '#5555bb'
                   :                       '#2a3a2a',
              opacity: 0.35 + i * 0.32,
              textShadow: '0 0 12px currentColor',
            }}>{m.text}</div>
          ))}
        </div>
      </div>

      {/* keyboard hint */}
      <div style={{
        width: CW, padding: '4px 14px', boxSizing: 'border-box',
        background: '#000008', borderTop: '1px solid #0a0a20',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', fontSize: 8,
      }}>
        <div style={{ display: 'flex', gap: 20, color: '#1a1a38' }}>
          <span><span style={{ color: '#272750' }}>WASD / ↑↓←→</span>&nbsp;Déplacer</span>
          <span><span style={{ color: '#1c3a2a' }}>ESPACE / E</span>&nbsp;Écho</span>
        </div>
        <button
          onPointerDown={e => { e.preventDefault(); handleEcho(); }}
          style={{
            background: 'none', border: '1px solid #00ccaa22',
            color: '#00ccaa44', fontFamily: FONT,
            fontSize: 8, letterSpacing: 3, padding: '3px 14px', cursor: 'pointer',
          }}>
          ◎ ÉCHO
        </button>
      </div>

      <DPad onMove={handleMove} onEcho={handleEcho} />

    </div>
  );
}