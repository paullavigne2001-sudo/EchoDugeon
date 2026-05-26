const FONT = "'Courier New', Courier, monospace";

const BASE = {
  width: 50, height: 50,
  background: 'rgba(0,0,18,.9)',
  border: '1px solid #1a1a3e',
  color: '#252555',
  fontFamily: FONT,
  fontSize: 18,
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  touchAction: 'none',
  WebkitUserSelect: 'none',
  userSelect: 'none',
};

const ECHO_BTN = {
  ...BASE,
  color: '#00aa8860',
  borderColor: '#00aa8830',
  fontSize: 14,
};

/**
 * Mobile D-pad with centre echo button.
 * Uses onPointerDown + preventDefault so it works on both touch and mouse
 * without triggering duplicate events.
 */
export function DPad({ onMove, onEcho }) {
  const tap = (fn) => (e) => { e.preventDefault(); fn(); };

  return (
    <div style={{
      padding: '8px 0 10px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 3,
    }}>
      <button onPointerDown={tap(() => onMove(0, -1))} style={BASE}>▲</button>

      <div style={{ display: 'flex', gap: 3 }}>
        <button onPointerDown={tap(() => onMove(-1, 0))} style={BASE}>◄</button>
        <button onPointerDown={tap(onEcho)}              style={ECHO_BTN}>◎</button>
        <button onPointerDown={tap(() => onMove( 1, 0))} style={BASE}>►</button>
      </div>

      <button onPointerDown={tap(() => onMove(0,  1))} style={BASE}>▼</button>
    </div>
  );
}
