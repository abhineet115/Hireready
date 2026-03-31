import { useNavigate } from 'react-router-dom';

export default function CheckoutCancel() {
  const navigate = useNavigate();

  return (
    <div className="page-container" style={{ paddingTop: '4rem', paddingBottom: '3rem', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Info icon */}
        <div style={{ marginBottom: '1.5rem' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto' }}>
            <circle cx="12" cy="12" r="10" fill="rgba(148,163,184,0.1)" stroke="#475569" strokeWidth="1.5" />
            <path d="M12 8v4m0 4h.01" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem' }}>
          Checkout Cancelled
        </h1>

        <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
          No worries — you weren't charged. Upgrade anytime to unlock PRO features and supercharge your job search.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            className="btn-primary"
            style={{ justifyContent: 'center' }}
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
          <button
            style={{
              background: 'transparent', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '0.5rem', padding: '0.6rem 1.25rem', color: '#94a3b8',
              cursor: 'pointer', fontSize: '0.9rem', transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.7)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
            onClick={() => navigate('/ats-scorer')}
          >
            Try Free Tools
          </button>
        </div>
      </div>
    </div>
  );
}
