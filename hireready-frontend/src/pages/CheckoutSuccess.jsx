import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    if (loading) return;
    // Allow time for the Stripe webhook to set the Firebase custom claim before refreshing
    const WEBHOOK_PROCESSING_DELAY_MS = 2000;
    const refresh = async () => {
      try {
        if (user) {
          await user.getIdToken(true);
        }
      } catch {
        // ignore
      } finally {
        setRefreshing(false);
      }
    };
    const timer = setTimeout(refresh, WEBHOOK_PROCESSING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [user, loading]);

  return (
    <div className="page-container" style={{ paddingTop: '4rem', paddingBottom: '3rem', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Checkmark icon */}
        <div style={{ marginBottom: '1.5rem' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto' }}>
            <circle cx="12" cy="12" r="10" fill="rgba(74,222,128,0.15)" stroke="#4ade80" strokeWidth="1.5" />
            <path d="M8 12l3 3 5-5" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 style={{
          fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #4ade80, #06b6d4)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Welcome to HireReady PRO!
        </h1>

        <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
          Your subscription is active. PRO features are now unlocked — enjoy unlimited scans, Resume Rewriter, Salary Scripts, and more.
        </p>

        {refreshing ? (
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Activating your PRO access…
          </p>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            className="btn-primary"
            style={{ justifyContent: 'center' }}
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
          <button
            style={{
              background: 'transparent', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '0.5rem', padding: '0.6rem 1.25rem', color: '#94a3b8',
              cursor: 'pointer', fontSize: '0.9rem', transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.7)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
            onClick={() => navigate('/resume-rewriter')}
          >
            Try Resume Rewriter
          </button>
        </div>
      </div>
    </div>
  );
}
