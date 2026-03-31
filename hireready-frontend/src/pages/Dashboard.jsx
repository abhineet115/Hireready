import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserUsage, getUserHistory, isBackendOffline } from '../services/api';

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function memberSince(dateStr) {
  if (!dateStr) return 'Unknown';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function Dashboard() {
  const { user, loading, loginWithGoogle, isPro, devMode, userType, usage, refreshUsage } = useAuth();
  const [history, setHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    const fetchData = async () => {
      try {
        const token = await user.getIdToken();
        const [usageData, historyData] = await Promise.all([
          getUserUsage(token),
          getUserHistory(token),
        ]);
        if (usageData) refreshUsage(usageData);
        if (historyData) setHistory(historyData.history || historyData || []);
      } catch {
        // backend offline or error — leave defaults
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshUsage]);

  if (loading) {
    return (
      <div className="page-container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <div style={{ color: '#94a3b8' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container" style={{ paddingTop: '4rem', paddingBottom: '3rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto', padding: '2.5rem 2rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 1rem', display: 'block', color: '#6366f1' }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>Sign in to view your dashboard</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Track your scans, view history, and manage your account.</p>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={loginWithGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  const accountLabel = userType === 'pro' ? 'PRO' : userType === 'user' ? 'Signed In (Free)' : 'Guest';
  const initials = user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : user.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <h1 className="section-title">Dashboard</h1>

      {devMode && (
        <div style={{ margin: '0.75rem 0 1.25rem', padding: '0.6rem 1rem', borderRadius: '0.5rem', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.4)', color: '#a855f7', fontSize: '0.85rem' }}>
          🛠 Dev Mode active — PRO features unlocked for testing
        </div>
      )}

      {/* Profile header */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {user.photoURL ? (
          <img src={user.photoURL} alt="avatar" style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid rgba(99,102,241,0.4)' }} />
        ) : (
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
        )}
        <div>
          <h2 style={{ color: '#f1f5f9', margin: 0, fontSize: '1.2rem' }}>{user.displayName || 'HireReady User'}</h2>
          <p style={{ color: '#94a3b8', margin: '0.15rem 0 0', fontSize: '0.875rem' }}>{user.email}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>Daily Scans Used</p>
          <p style={{ color: '#f1f5f9', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{usage.used}<span style={{ color: '#64748b', fontSize: '1rem', fontWeight: 400 }}>/{usage.limit}</span></p>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', height: '4px', marginTop: '0.6rem' }}>
            <div style={{ height: '4px', borderRadius: '9999px', width: `${Math.min((usage.used / usage.limit) * 100, 100)}%`, background: 'linear-gradient(90deg,#6366f1,#a855f7)' }} />
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>Account Type</p>
          <p style={{ margin: 0 }}>
            {userType === 'pro' ? (
              <span style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.25rem', fontWeight: 800 }}>⭐ PRO</span>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 600 }}>{accountLabel}</span>
            )}
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>Member Since</p>
          <p style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 600, margin: 0 }}>{memberSince(user.metadata?.creationTime)}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 style={{ color: '#f1f5f9', marginBottom: '1rem', fontSize: '1rem' }}>Recent Activity</h3>
        {loadingData ? (
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading history...</p>
        ) : history.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {history.slice(0, 10).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid rgba(99,102,241,0.1)' }}>
                <div>
                  <p style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.2rem' }}>{item.tool || item.type || 'Scan'}</p>
                  {item.preview && <p style={{ color: '#64748b', fontSize: '0.78rem', margin: 0 }}>{item.preview}</p>}
                </div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>{relativeTime(item.created_at || item.timestamp)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 0.75rem', display: 'block', color: '#64748b' }}>
              <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No scans yet. Start with the <a href="/ats-scorer" style={{ color: '#6366f1' }}>ATS Scorer</a>!</p>
          </div>
        )}
      </div>
    </div>
  );
}
