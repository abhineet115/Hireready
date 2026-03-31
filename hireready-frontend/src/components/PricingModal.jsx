export default function PricingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const features = [
    '100+ scans/day',
    'Resume Rewriter',
    'Salary Negotiation Scripts',
    'Advanced Interview Prep',
    'Ad-Free Experience',
    'Priority Support',
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%', maxWidth: '480px',
          background: 'rgba(26,26,40,0.95)',
          border: '1px solid rgba(168,85,247,0.4)',
          borderRadius: '1.25rem',
          padding: '2.5rem 2rem',
          boxShadow: '0 0 40px rgba(168,85,247,0.25)',
          textAlign: 'center',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#94a3b8', fontSize: '1.25rem', lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '2rem', height: '2rem', borderRadius: '50%',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Crown icon */}
        <div style={{ marginBottom: '1rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto' }}>
            <path d="M2 19h20v2H2v-2zM2 17l4-8 6 4 4-6 4 10H2z" fill="#f59e0b" />
            <circle cx="2" cy="9" r="1.5" fill="#fbbf24" />
            <circle cx="12" cy="5" r="1.5" fill="#fbbf24" />
            <circle cx="22" cy="9" r="1.5" fill="#fbbf24" />
          </svg>
        </div>

        {/* Heading */}
        <h2 style={{
          fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem',
          background: 'linear-gradient(135deg, #a855f7, #6366f1)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Upgrade to HireReady PRO
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Unlock all premium features and supercharge your job search
        </p>

        {/* Price */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f1f5f9' }}>$9</span>
          <span style={{ color: '#94a3b8', fontSize: '1rem' }}>/month</span>
        </div>

        {/* Feature list */}
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', textAlign: 'left' }}>
          {features.map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.45rem 0', color: '#f1f5f9', fontSize: '0.95rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="rgba(74,222,128,0.15)" />
                <path d="M8 12l3 3 5-5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <button
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '0.75rem' }}
          onClick={() => alert('Stripe integration coming soon!')}
        >
          Get PRO Access — $9/mo
        </button>
      </div>
    </div>
  );
}
