import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FREE_LINKS = [
  { to: '/ats-scorer',          label: 'ATS Scorer' },
  { to: '/interview-predictor', label: 'Interview Predictor' },
  { to: '/role-recommender',    label: 'Role Recommender' },
];

const PRO_LINKS = [
  { to: '/resume-rewriter',   label: 'Resume Rewriter' },
  { to: '/salary-negotiator', label: 'Salary Negotiator' },
  { to: '/advanced-prep',     label: 'Advanced Prep' },
  { to: '/cover-letter',      label: 'Cover Letter' },
];

export default function Navbar() {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    await loginWithGoogle();
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--color-neon-blue)' : 'var(--color-text-secondary)',
    fontWeight: isActive ? '600' : '400',
    fontSize: '0.875rem',
    padding: '0.25rem 0',
    borderBottom: isActive ? '1px solid var(--color-neon-blue)' : '1px solid transparent',
    transition: 'all 0.2s',
  });

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--color-neon-blue), var(--color-neon-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            HireReady
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <div style={{ display: 'flex', gap: '1rem' }}>
            {FREE_LINKS.map(l => (
              <NavLink key={l.to} to={l.to} style={navLinkStyle}>{l.label}</NavLink>
            ))}
          </div>
          <span style={{ color: 'var(--color-border)', fontSize: '1rem' }}>|</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {PRO_LINKS.map(l => (
              <NavLink key={l.to} to={l.to} style={navLinkStyle}>
                <span>{l.label}</span>
                <span style={{ fontSize: '0.65rem', background: 'linear-gradient(135deg, var(--color-neon-cyan), var(--color-neon-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, marginLeft: '4px' }}>PRO</span>
              </NavLink>
            ))}
          </div>

          {/* Auth */}
          {!loading && (
            user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <NavLink to="/dashboard" style={navLinkStyle}>Dashboard</NavLink>
                <NavLink to="/history" style={navLinkStyle}>History</NavLink>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {user.photoURL && (
                    <img src={user.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--color-neon-blue)' }} referrerPolicy="no-referrer" />
                  )}
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{user.displayName?.split(' ')[0]}</span>
                </div>
                <button onClick={handleLogout} className="btn-ghost" style={{ padding: '0.375rem 0.875rem' }}>Logout</button>
              </div>
            ) : (
              <button onClick={handleSignIn} className="btn-primary" style={{ padding: '0.375rem 0.875rem' }}>
                Sign in with Google
              </button>
            )
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="mobile-menu-btn"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--color-text-primary)' }}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--color-bg-surface)',
          borderTop: '1px solid var(--color-border)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          {[...FREE_LINKS, ...PRO_LINKS].map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-neon-blue)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? '600' : '400',
                padding: '0.5rem 0',
                borderBottom: '1px solid var(--color-border)',
              })}
            >
              {l.label}
            </NavLink>
          ))}
          {user && (
            <>
              <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} style={{ color: 'var(--color-text-secondary)', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                Dashboard
              </NavLink>
              <NavLink to="/history" onClick={() => setMenuOpen(false)} style={{ color: 'var(--color-text-secondary)', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                History
              </NavLink>
            </>
          )}
          <div style={{ paddingTop: '0.5rem' }}>
            {user ? (
              <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%' }}>Logout</button>
            ) : (
              <button onClick={handleSignIn} className="btn-primary" style={{ width: '100%' }}>Sign in with Google</button>
            )}
          </div>
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
