import { Link } from 'react-router-dom';

const tools = [
  { to: '/ats-scorer',          label: 'ATS Scorer',          desc: 'Check how your resume scores against job descriptions.', tag: 'FREE' },
  { to: '/interview-predictor', label: 'Interview Predictor',  desc: 'Get AI-predicted interview questions for your target role.', tag: 'FREE' },
  { to: '/role-recommender',    label: 'Role Recommender',     desc: 'Discover roles that match your skills and experience.', tag: 'FREE' },
  { to: '/resume-rewriter',     label: 'Resume Rewriter',      desc: 'Rewrite your resume bullets with AI-powered suggestions.', tag: 'PRO' },
  { to: '/salary-negotiator',   label: 'Salary Negotiator',    desc: 'Build your salary negotiation strategy with market data.', tag: 'PRO' },
  { to: '/advanced-prep',       label: 'Advanced Interview Prep', desc: 'Deep-dive preparation with topics, red flags and projects.', tag: 'PRO' },
  { to: '/cover-letter',        label: 'Cover Letter Generator', desc: 'Generate a tailored, compelling cover letter in seconds.', tag: 'PRO' },
];

export default function Home() {
  return (
    <div style={{ padding: '4rem 0' }}>
      <div className="page-container">
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--color-neon-blue), var(--color-neon-purple), var(--color-neon-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Land Your Dream Job Faster
          </h1>
          <p className="section-subtitle" style={{ maxWidth: '560px', margin: '0 auto 2rem' }}>
            AI-powered career tools that help you stand out — from ATS optimization to interview prep and salary negotiation.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/ats-scorer" className="btn-primary">Get Started Free</Link>
            <Link to="/dashboard" className="btn-ghost">View Dashboard</Link>
          </div>
        </div>

        {/* Tools Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {tools.map(t => (
            <Link key={t.to} to={t.to} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ height: '100%', transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-neon-blue)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--color-text-primary)' }}>{t.label}</h3>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '9999px', background: t.tag === 'PRO' ? 'linear-gradient(135deg, var(--color-neon-cyan), var(--color-neon-purple))' : 'rgba(99,102,241,0.15)', color: t.tag === 'PRO' ? 'white' : 'var(--color-neon-blue)' }}>
                    {t.tag}
                  </span>
                </div>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
