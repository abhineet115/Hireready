import { Link } from 'react-router-dom';

const YEAR = new Date().getFullYear();

const columns = [
  {
    title: 'Brand',
    items: [
      { label: 'About HireReady', href: '#' },
      { label: 'Blog',            href: '#' },
      { label: 'Careers',         href: '#' },
    ],
  },
  {
    title: 'Free Tools',
    items: [
      { label: 'ATS Scorer',          to: '/ats-scorer' },
      { label: 'Interview Predictor', to: '/interview-predictor' },
      { label: 'Role Recommender',    to: '/role-recommender' },
    ],
  },
  {
    title: 'Pro Tools',
    items: [
      { label: 'Resume Rewriter',   to: '/resume-rewriter' },
      { label: 'Salary Negotiator', to: '/salary-negotiator' },
      { label: 'Advanced Prep',     to: '/advanced-prep' },
    ],
  },
  {
    title: 'Social',
    items: [
      { label: 'GitHub',   href: 'https://github.com' },
      { label: 'Twitter',  href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-bg-surface)',
      borderTop: '1px solid var(--color-border)',
      marginTop: 'auto',
    }}>
      <div className="page-container" style={{ padding: '3rem 1.5rem 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          {columns.map(col => (
            <div key={col.title}>
              <h4 style={{ color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {col.items.map(item => (
                  <li key={item.label}>
                    {item.to ? (
                      <Link to={item.to} style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = 'var(--color-neon-blue)'}
                        onMouseLeave={e => e.target.style.color = 'var(--color-text-secondary)'}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a href={item.href} style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', transition: 'color 0.2s' }}
                        target={item.href?.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        onMouseEnter={e => e.target.style.color = 'var(--color-neon-blue)'}
                        onMouseLeave={e => e.target.style.color = 'var(--color-text-secondary)'}
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            © {YEAR} HireReady. All rights reserved.
          </span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            Built with ❤️ for job seekers everywhere
          </span>
        </div>
      </div>
    </footer>
  );
}
