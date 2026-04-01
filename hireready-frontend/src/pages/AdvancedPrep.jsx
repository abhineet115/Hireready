import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { prepInterview, uploadResume, isBackendOffline } from '../services/api';
import PricingModal from '../components/PricingModal';
import CooldownButton from '../components/CooldownButton';

function mockPrep(_jdText) {
  return {
    priority_topics: [
      { topic: 'System Design & Architecture', importance: 'High', reason: 'Frequently assessed for senior roles to evaluate scalability thinking.' },
      { topic: 'Behavioral & Leadership', importance: 'High', reason: 'STAR-format responses are expected for all mid-to-senior positions.' },
      { topic: 'Domain-Specific Technical Skills', importance: 'High', reason: 'Core competency matching the job description requirements.' },
      { topic: 'Cross-functional Collaboration', importance: 'Medium', reason: 'Modern roles require strong stakeholder communication skills.' },
      { topic: 'Data-Driven Decision Making', importance: 'Medium', reason: 'Ability to use metrics to inform decisions is increasingly valued.' },
      { topic: 'Agile / Project Management', importance: 'Low', reason: 'Basic familiarity with delivery frameworks is a plus.' },
    ],
    practice_questions: [
      {
        question: 'How would you design a system to handle 1 million concurrent users?',
        concepts: ['Load balancing', 'Horizontal scaling', 'Caching strategy', 'Database sharding'],
        model_answer: 'Start by breaking the system into layers: frontend CDN, load balancer, stateless application servers, distributed cache (Redis), and a primary-replica database. Use auto-scaling groups based on CPU/memory metrics. Implement circuit breakers and rate limiting at the API gateway layer.',
      },
      {
        question: 'Tell me about a time you drove a significant impact at your company.',
        concepts: ['STAR method', 'Quantifiable outcomes', 'Leadership', 'Business alignment'],
        model_answer: 'Describe the Situation (context and scope), your Task (your responsibility), the Actions you took (specific steps), and the measurable Results (%, $, time saved). Keep it concise — 2 minutes max.',
      },
      {
        question: 'How do you prioritize competing tasks from multiple stakeholders?',
        concepts: ['Stakeholder management', 'Prioritization frameworks', 'Communication', 'Trade-off analysis'],
        model_answer: 'I use a combination of impact vs. effort mapping and regular stakeholder sync. When priorities conflict, I surface the trade-offs to decision-makers with data, align on business goals, and document the agreed priority order.',
      },
    ],
    red_flags: [
      'Gaps in technical fundamentals related to the core stack mentioned in the JD.',
      'Lack of concrete metrics or outcomes in your experience stories.',
      'No clear examples of cross-team collaboration or conflict resolution.',
    ],
    projects_to_mention: [
      'Any project with measurable business impact (revenue, cost savings, performance gains).',
      'Open-source contributions or side projects relevant to the role\'s tech stack.',
      'Leadership experiences: mentoring, leading a team, or driving an initiative end-to-end.',
    ],
  };
}

const importanceColors = { High: '#ef4444', Medium: '#f59e0b', Low: '#4ade80' };

export default function AdvancedPrep() {
  const { getIdToken, isPro, devMode } = useAuth();
  const [jdText, setJdText] = useState('');
  const [resumeTab, setResumeTab] = useState('paste');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const fileInputRef = useRef(null);

  const showUpgrade = !isPro && !devMode;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File exceeds 5MB limit.'); return; }
    setResumeFile(file);
    setError('');
  };

  const handlePrep = async () => {
    setError('');
    if (!jdText.trim()) { setError('Please provide the job description.'); return; }

    let finalResume = resumeText;
    if (resumeTab === 'upload' && resumeFile) {
      try {
        const token = await getIdToken();
        const uploadRes = await uploadResume(resumeFile, token);
        finalResume = uploadRes.text || uploadRes.resume_text || '';
      } catch {
        if (isBackendOffline()) {
          setOffline(true);
          finalResume = resumeFile.name;
        } else {
          setError('Upload failed. Please paste resume text instead.');
          return;
        }
      }
    }

    try {
      const token = await getIdToken();
      const data = await prepInterview(jdText, finalResume, token);
      setResult(data);
    } catch {
      if (isBackendOffline()) {
        setOffline(true);
        setResult(mockPrep(jdText));
      } else {
        setError('Generation failed. Please try again.');
      }
    }
  };

  const tabStyle = (active) => ({
    padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer',
    borderRadius: '0.375rem', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
    background: active ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'transparent',
    color: active ? '#fff' : '#94a3b8',
  });

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '0.5rem', color: '#f1f5f9', padding: '0.75rem', fontSize: '0.875rem',
    resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
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
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Advanced Interview Prep is available to PRO members. Get a comprehensive prep guide tailored to the specific job.</p>
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
      <h1 className="section-title">Advanced Interview Prep</h1>
      <p className="section-subtitle">Get a comprehensive prep guide generated specifically for the job.</p>

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

      <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="card">
          <h3 style={{ color: '#f1f5f9', marginBottom: '0.75rem', fontSize: '1rem' }}>Job Description <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>*required</span></h3>
          <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste the full job description here..." rows={8} style={inputStyle} />
        </div>

        <div className="card">
          <h3 style={{ color: '#f1f5f9', marginBottom: '1rem', fontSize: '1rem' }}>Your Resume <span style={{ color: '#64748b', fontSize: '0.8rem' }}>(optional — improves personalization)</span></h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.04)', padding: '0.25rem', borderRadius: '0.5rem', width: 'fit-content' }}>
            <button style={tabStyle(resumeTab === 'paste')} onClick={() => setResumeTab('paste')}>Paste Text</button>
            <button style={tabStyle(resumeTab === 'upload')} onClick={() => setResumeTab('upload')}>Upload PDF</button>
          </div>
          {resumeTab === 'paste' ? (
            <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your resume here (optional)..." rows={6} style={inputStyle} />
          ) : (
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
              >
                {resumeFile ? <span style={{ color: '#4ade80', fontWeight: 600 }}>{resumeFile.name}</span> : <span style={{ color: '#94a3b8' }}>Click to upload PDF (max 5MB)</span>}
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
              {resumeFile && (
                <button onClick={() => { setResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ marginTop: '0.5rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>
                  × Clear file
                </button>
              )}
            </div>
          )}
        </div>

        <div><CooldownButton onClick={handlePrep}>Generate Prep Guide</CooldownButton></div>
      </div>

      {result && (
        <div style={{ marginTop: '2.5rem', display: 'grid', gap: '2rem' }}>
          {/* Priority Topics */}
          {result.priority_topics?.length > 0 && (
            <div>
              <h3 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>🎯 Priority Topics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {result.priority_topics.map((t, i) => (
                  <div key={i} className="card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>{t.topic}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: `${importanceColors[t.importance]}22`, color: importanceColors[t.importance], border: `1px solid ${importanceColors[t.importance]}44`, whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                        {t.importance}
                      </span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>{t.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practice Questions */}
          {result.practice_questions?.length > 0 && (
            <div>
              <h3 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>📝 Practice Questions</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {result.practice_questions.map((q, i) => (
                  <div key={i} className="card">
                    <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.95rem', margin: '0 0 0.75rem' }}>{i + 1}. {q.question}</p>
                    {q.concepts?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                        {q.concepts.map(c => (
                          <span key={c} style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '0.375rem', padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}>{c}</span>
                        ))}
                      </div>
                    )}
                    {q.model_answer && (
                      <blockquote style={{ margin: 0, padding: '0.75rem 1rem', borderLeft: '3px solid rgba(34,211,238,0.5)', background: 'rgba(34,211,238,0.05)', borderRadius: '0 0.5rem 0.5rem 0', color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.7 }}>
                        <strong style={{ color: '#22d3ee', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>MODEL ANSWER</strong>
                        {q.model_answer}
                      </blockquote>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {result.red_flags?.length > 0 && (
            <div className="card">
              <h4 style={{ color: '#ef4444', marginBottom: '1rem' }}>🚩 Potential Red Flags to Address</h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {result.red_flags.map((f, i) => (
                  <li key={i} style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Projects to Mention */}
          {result.projects_to_mention?.length > 0 && (
            <div className="card">
              <h4 style={{ color: '#22d3ee', marginBottom: '1rem' }}>💡 Projects & Stories to Mention</h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {result.projects_to_mention.map((p, i) => (
                  <li key={i} style={{ color: '#22d3ee', fontSize: '0.875rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
