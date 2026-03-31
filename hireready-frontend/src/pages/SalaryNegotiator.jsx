export default function SalaryNegotiator() {
  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <h1 className="section-title">Salary Negotiator</h1>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'linear-gradient(135deg, var(--color-neon-cyan), var(--color-neon-purple))', color: 'white' }}>PRO</span>
        </div>
        <p className="section-subtitle">Build your salary negotiation strategy with real market data.</p>
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Salary negotiation tool coming soon.</p>
        </div>
      </div>
    </div>
  );
}
