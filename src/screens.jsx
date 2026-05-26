const FONT = "'Courier New', Courier, monospace";

/* ── shared button factory ───────────────────────────────────────────────── */
const outlineBtn = (color) => ({
  background: 'none',
  border: `1px solid ${color}`,
  color,
  fontFamily: FONT,
  fontSize: 11,
  letterSpacing: 7,
  padding: '14px 52px',
  cursor: 'pointer',
  textShadow: `0 0 14px ${color}88`,
  boxShadow: `0 0 30px ${color}1a, inset 0 0 30px ${color}08`,
});

/* ── MenuScreen ──────────────────────────────────────────────────────────── */
export function MenuScreen({ onStart }) {
  return (
    <div style={{
      background: '#010008', fontFamily: FONT,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 40, boxSizing: 'border-box',
    }}>

      {/* title */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div style={{
          color: '#00ddb5', fontSize: 38, letterSpacing: 16, marginBottom: 4,
          textShadow: '0 0 60px #00ddb53a, 0 0 120px #00ddb518',
        }}>ECHO</div>
        <div style={{ color: '#14143a', fontSize: 20, letterSpacing: 14, marginBottom: 4 }}>
          DUNGEON
        </div>
        <div style={{ color: '#0b0b26', fontSize: 8, letterSpacing: 7 }}>
          VOIR AVEC LE SON
        </div>
      </div>

      {/* controls */}
      <div style={{
        border: '1px solid #0e0e2a', padding: '20px 30px', marginBottom: 40,
        fontSize: 9, lineHeight: 2.5, letterSpacing: 1, color: '#17173f',
        textAlign: 'left',
      }}>
        <div><span style={{ color: '#2e2e6a' }}>WASD / ZQSD / ←↑↓→</span>&nbsp;&nbsp;Déplacement</div>
        <div><span style={{ color: '#00aa8840' }}>ESPACE / E</span>&nbsp;&nbsp;Impulsion sonore</div>
        <div style={{ marginTop: 10, color: '#0d0d22', lineHeight: 2 }}>
          Chaque son révèle… et attire.<br />
          <span style={{ color: '#0c0c1e' }}>Mémorisez l'obscurité. Survivez.</span>
        </div>
      </div>

      {/* enemy legend */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        alignItems: 'center', marginBottom: 30,
        fontSize: 8, color: '#12122a', letterSpacing: 1,
      }}>
        <div><span style={{ color: '#ff444455' }}>◈ TRAQUEUR</span> — suit le bruit</div>
        <div><span style={{ color: '#ff881555' }}>◈ RÔDEUR</span> — embuscade silencieuse</div>
        <div><span style={{ color: '#6655ff55' }}>◈ FANTÔME</span> — draine vos échos</div>
      </div>

      <button onClick={onStart} style={outlineBtn('#00ddb5')}>
        COMMENCER
      </button>
    </div>
  );
}

/* ── GameOverScreen ──────────────────────────────────────────────────────── */
export function GameOverScreen({ win, score, onRestart }) {
  const color = win ? '#00ddb5' : '#ff1133';

  return (
    <div style={{
      background: '#010008', fontFamily: FONT,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 40,
    }}>
      <div style={{
        color, fontSize: 28, letterSpacing: 6, marginBottom: 12,
        textShadow: `0 0 35px ${color}48`,
      }}>
        {win ? 'ÉVADÉ' : 'OBSCURITÉ TOTALE'}
      </div>

      <div style={{ color: '#0e0e30', fontSize: 9, letterSpacing: 4, marginBottom: 32 }}>
        {win
          ? 'Vous avez traversé les ténèbres.'
          : 'Vous avez péri dans les profondeurs.'}
      </div>

      <div style={{ color: '#886622', fontSize: 14, letterSpacing: 4, marginBottom: 44 }}>
        SCORE&nbsp;<span style={{ color: '#aa9930' }}>{score}</span>
      </div>

      <button onClick={onRestart} style={outlineBtn(color)}>
        RÉESSAYER
      </button>
    </div>
  );
}
