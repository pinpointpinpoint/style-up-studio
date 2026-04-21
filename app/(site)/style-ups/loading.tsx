export default function Loading() {
  return (
    <div
      aria-label="Loading style ups"
      style={{
        borderTop: '1px solid black',
        height: '100%',
        width: '100%',
        background: 'white',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '10px 30px',
        color: 'var(--disabled)',
        fontSize: 'var(--font-sm)',
      }}
    >
      [LOADING]
    </div>
  )
}
