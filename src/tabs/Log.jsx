export default function Log({ logs = [], onClearLogs }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Trick Log</h2>
        {logs.length > 0 && (
          <button 
            onClick={onClearLogs}
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.8rem',
              background: 'rgba(211, 47, 47, 0.2)',
              border: '1px solid #d32f2f',
              color: '#ff6666',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear History
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>
          No tricks logged. Go hit some tricks in the Generator!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: '0.8rem 1rem',
                borderRadius: '6px',
                background: 'rgba(25, 35, 50, 0.4)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ fontWeight: 500 }}>{log.name}</div>
              <div 
                style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--color-text-secondary)' 
                }}
              >
                {log.timestamp}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}