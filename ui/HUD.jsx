import { MAX_ECHOES, MAX_FLOOR } from '../constants.js';

const FONT = "'Courier New', Courier, monospace";

/**
 * Top HUD bar — HP, echo charges, noise level, floor, score.
 * Pure display component; receives all values as props.
 */
export function HUD({ hp, echoes, noise, score, floor }) {
  const maxHp = 5;

  const noiseColor = noise > 65 ? '#ff2233'
                   : noise > 35 ? '#ff8822'
                   : '#1e3a2a';

  const noiseLabel = noise > 65 ? '███ ÉLEVÉ'
                   : noise > 35 ? '██░ MODÉRÉ'
                   : noise > 8  ? '█░░ FAIBLE'
                   :              '─── SILENCE';

  return (
    <div style={{
      width: '100%', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '5px 14px', boxSizing: 'border-box',
      background: '#000008', borderBottom: '1px solid #0a0a20',
      fontFamily: FONT, fontSize: 10,
    }}>

      {/* left: HP + echo charges */}
      <div style={{ display: 'flex', gap: 16 }}>
        <span>
          <span style={{ color: '#2a1020' }}>HP </span>
          <span style={{ color: hp > 2 ? '#ff3344' : '#ff0011', letterSpacing: 2 }}>
            {'█'.repeat(Math.max(0, hp))}
            {'░'.repeat(Math.max(0, maxHp - hp))}
          </span>
        </span>
        <span>
          <span style={{ color: '#0c2a22' }}>◎ </span>
          <span style={{ color: '#00ccaa', letterSpacing: 2 }}>
            {'◉'.repeat(Math.max(0, echoes))}
            {'○'.repeat(Math.max(0, MAX_ECHOES - echoes))}
          </span>
        </span>
      </div>

      {/* right: noise + floor + score */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span style={{ color: noiseColor, letterSpacing: 1, fontSize: 9 }}>
          {noiseLabel}
        </span>
        <span style={{ color: '#1a1a44', fontSize: 9 }}>
          ÉTAGE <span style={{ color: '#3a3a88' }}>{floor}</span>/{MAX_FLOOR}
        </span>
        <span style={{ color: '#665512', fontSize: 9 }}>
          ◆ <span style={{ color: '#998822' }}>{score}</span>
        </span>
      </div>

    </div>
  );
}
