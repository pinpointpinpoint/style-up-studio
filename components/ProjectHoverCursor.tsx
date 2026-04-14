// ProjectHoverCursor.tsx
export default function ProjectHoverCursor({ x, y, text }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 9999,
        color: 'white',
        background: 'black',
        height: 'fit-content',
        width: 'fit-content',
      }}
    >
      {text}
    </div>
  );
}
