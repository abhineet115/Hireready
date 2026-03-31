import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div className="page-container">
          <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '3rem 0' }}>
        <div className="page-container" style={{ textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Sign in to access your Dashboard</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Track your progress, saved analyses, and pro features.
            </p>
            <Link to="/" className="btn-primary">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          {user.photoURL && (
            <img src={user.photoURL} alt="" style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--color-neon-blue)' }} referrerPolicy="no-referrer" />
          )}
          <div>
            <h1 className="section-title" style={{ marginBottom: 0 }}>Welcome, {user.displayName?.split(' ')[0]}!</h1>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}>{user.email}</p>
          </div>
        </div>
        <div className="card">
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem' }}>
            Dashboard features coming soon — usage history, saved results, and pro status will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
