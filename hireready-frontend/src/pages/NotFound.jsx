import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ padding: '6rem 0', textAlign: 'center' }}>
      <div className="page-container">
        <h1 style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--color-neon-blue)', marginBottom: '0.5rem' }}>404</h1>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>Page Not Found</h2>
        <p className="section-subtitle" style={{ marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}
