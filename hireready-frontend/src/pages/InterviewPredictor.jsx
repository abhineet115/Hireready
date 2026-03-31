import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { predictInterview, isBackendOffline } from '../services/api';
import CooldownButton from '../components/CooldownButton';

const QUESTION_BANK = [
  { category: 'Behavioral', question: 'Tell me about a time you overcame a significant challenge at work.', tip: 'Use the STAR method: Situation, Task, Action, Result.' },
  { category: 'Behavioral', question: 'Describe a situation where you had to work with a difficult team member.', tip: 'Focus on how you maintained professionalism and found common ground.' },
  { category: 'Behavioral', question: 'Give an example of when you showed leadership without a formal title.', tip: 'Highlight initiative, influence, and measurable outcomes.' },
  { category: 'Behavioral', question: 'Tell me about a time you failed and what you learned.', tip: 'Be honest; emphasize your growth and what you\'d do differently.' },
  { category: 'Behavioral', question: 'Describe a time you had to meet a tight deadline.', tip: 'Explain how you prioritized tasks and managed time effectively.' },
  { category: 'Technical', question: 'Walk me through how you would debug a production issue.', tip: 'Mention logging, monitoring, reproduction steps, and rollback plans.' },
  { category: 'Technical', question: 'How do you ensure code quality in your projects?', tip: 'Discuss code reviews, testing strategies, and documentation.' },
  { category: 'Technical', question: 'Explain a complex technical concept you\'ve implemented recently.', tip: 'Use simple language and connect it to business value.' },
  { category: 'Technical', question: 'How do you stay updated with industry trends and new technologies?', tip: 'Mention specific resources like blogs, courses, or communities.' },
  { category: 'Technical', question: 'Describe your approach to system design for a scalable application.', tip: 'Cover load balancing, caching, databases, and microservices.' },
  { category: 'Situational', question: 'If you were assigned a project with unclear requirements, how would you proceed?', tip: 'Emphasize clarifying questions, documentation, and stakeholder alignment.' },
  { category: 'Situational', question: 'How would you handle a situation where you disagree with your manager\'s decision?', tip: 'Show respect while clearly explaining your perspective with data.' },
  { category: 'Situational', question: 'If your team is behind on a sprint, what steps would you take?', tip: 'Talk about root cause analysis, re-prioritization, and communication.' },
  { category: 'Situational', question: 'How would you onboard a new team member effectively?', tip: 'Mention documentation, pair programming, and regular check-ins.' },
  { category: 'Situational', question: 'If given competing priorities from two managers, how would you handle it?', tip: 'Discuss open communication and getting alignment from stakeholders.' },
];

function mockPredict(jobTitle) {
  const titleLower = jobTitle.toLowerCase();
  const seed = titleLower.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const shuffled = [...QUESTION_BANK].sort((a, b) => {
    const ha = (seed * (QUESTION_BANK.indexOf(a) + 1)) % 97;
    const hb = (seed * (QUESTION_BANK.indexOf(b) + 1)) % 97;
    return ha - hb;
  });
  // ensure at least 1 of each category
  const result = [];
  ['Behavioral', 'Technical', 'Situational'].forEach(cat => {
    const q = shuffled.find(q => q.category === cat && !result.includes(q));
    if (q) result.push(q);
  });
  shuffled.forEach(q => { if (result.length < 5 && !result.includes(q)) result.push(q); });
  return result.slice(0, 5);
}

const categoryColors = {
  Behavioral: { bg: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: 'rgba(34,211,238,0.3)' },
  Technical: { bg: 'rgba(168,85,247,0.12)', color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
  Situational: { bg: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
};

export default function InterviewPredictor() {
  const { getIdToken } = useAuth();
  const [jobTitle, setJobTitle] = useState('');
  const [expLevel, setExpLevel] = useState('Entry Level (0-2 yrs)');
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);

  const handlePredict = async () => {
    setError('');
    if (!jobTitle.trim()) { setError('Please enter a job title.'); return; }
    try {
      const token = await getIdToken();
      const data = await predictInterview(jobTitle, expLevel, token);
      setQuestions(data.questions || data);
    } catch {
      if (isBackendOffline()) {
        setOffline(true);
        setQuestions(mockPredict(jobTitle));
      } else {
        setError('Prediction failed. Please try again.');
      }
    }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '0.5rem', color: '#f1f5f9', padding: '0.75rem', fontSize: '0.875rem',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  return (
    <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <h1 className="section-title">Interview Question Predictor</h1>
      <p className="section-subtitle">Get AI-predicted interview questions tailored to your role.</p>

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
        <div>
          <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.4rem' }}>Job Title</label>
          <input
            type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
            placeholder="e.g. Software Engineer, Product Manager..."
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.4rem' }}>Experience Level</label>
          <select value={expLevel} onChange={e => setExpLevel(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option>Entry Level (0-2 yrs)</option>
            <option>Mid Level (3-5 yrs)</option>
            <option>Senior Level (6-10 yrs)</option>
            <option>Lead / Manager (10+ yrs)</option>
          </select>
        </div>
        <div><CooldownButton onClick={handlePredict}>Predict Questions</CooldownButton></div>
      </div>

      {questions && (
        <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
          {questions.map((q, i) => {
            const colors = categoryColors[q.category] || categoryColors.Behavioral;
            return (
              <div key={i} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: colors.bg, color: colors.color, border: `1px solid ${colors.border}` }}>
                    {q.category}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Question {i + 1}</span>
                </div>
                <p style={{ color: '#f1f5f9', fontWeight: 500, margin: '0 0 0.75rem', lineHeight: 1.6 }}>{q.question}</p>
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.5rem', padding: '0.6rem 0.85rem' }}>
                  <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>💡 </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.825rem' }}>{q.tip}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
