import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { negotiateSalary, isBackendOffline } from '../services/api';
import PricingModal from '../components/PricingModal';
import CooldownButton from '../components/CooldownButton';

function mockNegotiate(jobTitle, location, targetSalary) {
  return {
    market_insight: `Based on current market data for ${jobTitle} roles in ${location}, the compensation range typically falls between $${Math.round(targetSalary * 0.85).toLocaleString()} and $${Math.round(targetSalary * 1.2).toLocaleString()} annually. Your target of $${Number(targetSalary).toLocaleString()} is within a competitive range. The job market for this role is currently active with strong demand for qualified candidates.`,
    scripts: [
      {
        scenario: 'Initial Offer',
        script: `"Thank you so much for the offer — I'm genuinely excited about this opportunity at [Company]. Based on my research into the market rate for ${jobTitle} roles in ${location} and my experience in [key skill], I was hoping we could discuss a base salary closer to $${Number(targetSalary).toLocaleString()}. Is there flexibility there?"`,
      },
      {
        scenario: 'Email Follow-up',
        script: `Subject: Re: Job Offer — [Your Name]\n\nHi [Hiring Manager],\n\nThank you again for the offer. After careful consideration, I remain very enthusiastic about joining the team. I'd like to respectfully revisit the base salary. Given my background and the current market rates for ${jobTitle} in ${location}, I believe $${Number(targetSalary).toLocaleString()} more accurately reflects the value I bring. I'm confident this is a mutually beneficial arrangement and look forward to your thoughts.\n\nBest,\n[Your Name]`,
      },
      {
        scenario: 'Final Ask',
        script: `"I really appreciate everything you've put into this process, and I'm committed to making this work. If we can get to $${Number(targetSalary).toLocaleString()} on base — even with a 90-day review to revisit — I'm ready to sign today. This is genuinely my dream role and I want to make it happen."`,
      },
    ],
    leverage_tips: [
      'Research and cite specific salary data from Glassdoor, Levels.fyi, or LinkedIn Salary.',
      'Emphasize your unique skills and any competing offers you may have.',
      'Always negotiate via voice/video first — save email for follow-ups.',
      'Focus on total compensation: equity, bonus, PTO, and remote flexibility matter.',
      'Express genuine enthusiasm — employers want to hire people who want to be there.',
    ],
  };
}

export default function SalaryNegotiator() {
  const { getIdToken, isPro, devMode } = useAuth();
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [targetSalary, setTargetSalary] = useState('');
  const [skills, setSkills] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  const showUpgrade = !isPro && !devMode;

  const handleGenerate = async () => {
    setError('');
    if (!jobTitle.trim()) { setError('Please enter a job title.'); return; }
    if (!targetSalary) { setError('Please enter your target salary.'); return; }
    try {
      const token = await getIdToken();
      const data = await negotiateSalary(jobTitle, location, targetSalary, skills, token);
      setResult(data);
    } catch {
      if (isBackendOffline()) {
        setOffline(true);
        setResult(mockNegotiate(jobTitle, location || 'your market', targetSalary));
      } else {
        setError('Generation failed. Please try again.');
      }
    }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '0.5rem', color: '#f1f5f9', padding: '0.75rem', fontSize: '0.875rem',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  if (showUpgrade) {
    return (
      <div className="page-container" style={{ paddingTop: '4rem', paddingBottom: '3rem', textAlign: 'center' }}>
        <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
        <div className="card" style={{ maxWidth: '460px', margin: '0 auto', padding: '2.5rem 2rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 1rem', display: 'block' }}>
            <path d="M2 19h20v2H2v-2zM2 17l4-8 6 4 4-6 4 10H2z" fill="#f59e0b" />
            <circle cx="2" cy="9" r="1.5" fill="#fbbf24" /><circle cx="12" cy="5" r="1.5" fill="#fbbf24" /><circle cx="22" cy="9" r="1.5" fill="#fbbf24" />
          </svg>
          <h2 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>PRO Feature</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Salary Negotiation Scripts are available to PRO members. Get personalized scripts and leverage tips.</p>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setPricingOpen(true)}>
            Upgrade to PRO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
      <h1 className="section-title">Salary Negotiator</h1>
      <p className="section-subtitle">Get personalized negotiation scripts to maximize your offer.</p>

      {offline && (
        <div style={{ margin: '1rem 0', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', fontSize: '0.875rem' }}>
          ⚠️ Backend is offline — showing mock results for demo purposes.
        </div>
      )}
      {error && (
        <div style={{ margin: '1rem 0', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.4rem' }}>Job Title</label>
            <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Senior Product Manager" style={inputStyle} />
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.4rem' }}>Location / Market</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.4rem' }}>Target Salary (USD/year)</label>
          <input type="number" value={targetSalary} onChange={e => setTargetSalary(e.target.value)} placeholder="e.g. 120000" style={inputStyle} />
        </div>
        <div>
          <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.4rem' }}>Key Skills & Accomplishments</label>
          <textarea value={skills} onChange={e => setSkills(e.target.value)} placeholder="Describe your key skills, certifications, and notable achievements..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div><CooldownButton onClick={handleGenerate}>Generate Scripts</CooldownButton></div>
      </div>

      {result && (
        <div style={{ marginTop: '2.5rem', display: 'grid', gap: '1.5rem' }}>
          {result.market_insight && (
            <div className="card" style={{ borderLeft: '3px solid #6366f1' }}>
              <h4 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>📊 Market Insight</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>{result.market_insight}</p>
            </div>
          )}

          {result.scripts?.length > 0 && (
            <div>
              <h3 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>💬 Negotiation Scripts</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {result.scripts.map((s, i) => (
                  <div key={i} className="card">
                    <span style={{ display: 'inline-block', background: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '0.375rem', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>{s.scenario}</span>
                    <blockquote style={{ margin: 0, padding: '0.75rem 1rem', borderLeft: '3px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.05)', borderRadius: '0 0.5rem 0.5rem 0', color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {s.script}
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.leverage_tips?.length > 0 && (
            <div className="card">
              <h4 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>🎯 Leverage Tips</h4>
              <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                {result.leverage_tips.map((tip, i) => (
                  <li key={i} style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>{tip}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
