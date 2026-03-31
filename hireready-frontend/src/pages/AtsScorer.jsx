import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeAts, uploadResume, isBackendOffline } from '../services/api';
import CircularProgress from '../components/CircularProgress';
import CooldownButton from '../components/CooldownButton';

const STOP_WORDS = new Set([
  'the','and','for','with','that','this','from','have','will','your',
  'are','was','been','has','not','but','they','them','their','which',
  'when','where','what','who','how','can','could','would','should',
  'may','might','must',
]);

function mockAnalyze(resumeText, jdText) {
  const jdWords = jdText
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 4 && !STOP_WORDS.has(w));
  const unique = [...new Set(jdWords)];
  const resumeLower = resumeText.toLowerCase();
  const matched = unique.filter(w => resumeLower.includes(w));
  const missing = unique.filter(w => !resumeLower.includes(w)).slice(0, 10);
  const score = unique.length > 0 ? Math.round((matched.length / unique.length) * 100) : 0;
  return {
    score,
    matched_keywords: matched.slice(0, 15),
    missing_keywords: missing,
    suggestions: [
      'Add more quantifiable achievements (e.g., "increased revenue by 30%").',
      'Tailor your summary to the specific job description.',
      'Include all relevant keywords from the job posting.',
      'Use active voice and strong action verbs throughout.',
      'Ensure your contact information and LinkedIn profile are up to date.',
    ],
    section_breakdown: null,
  };
}

export default function AtsScorer() {
  const { getIdToken } = useAuth();
  const [tab, setTab] = useState('paste');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const fileInputRef = useRef(null);

  const wordCount = (t) => t.trim() ? t.trim().split(/\s+/).length : 0;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File exceeds 5MB limit.'); return; }
    setResumeFile(file);
    setError('');
  };

  const handleAnalyze = async () => {
    setError('');
    setResult(null);
    let finalText = resumeText;

    if (tab === 'upload' && resumeFile) {
      try {
        const token = await getIdToken();
        const uploadRes = await uploadResume(resumeFile, token);
        finalText = uploadRes.text || uploadRes.resume_text || '';
      } catch {
        if (isBackendOffline()) {
          setOffline(true);
          finalText = resumeFile.name;
        } else {
          setError('Upload failed. Please try pasting text instead.');
          return;
        }
      }
    }

    if (!finalText.trim()) { setError('Please provide your resume text.'); return; }
    if (!jdText.trim()) { setError('Please provide the job description.'); return; }

    try {
      const token = await getIdToken();
      const data = await analyzeAts(finalText, jdText, token);
      setResult({ ...data, fromApi: true });
    } catch {
      if (isBackendOffline()) {
        setOffline(true);
        setResult({ ...mockAnalyze(finalText, jdText), fromApi: false });
      } else {
        setError('Analysis failed. Please try again.');
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

  return (
    <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <h1 className="section-title">ATS Resume Scorer</h1>
      <p className="section-subtitle">Analyze how well your resume matches a job description.</p>

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
          <h3 style={{ color: '#f1f5f9', marginBottom: '1rem', fontSize: '1rem' }}>Your Resume</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.04)', padding: '0.25rem', borderRadius: '0.5rem', width: 'fit-content' }}>
            <button style={tabStyle(tab === 'paste')} onClick={() => setTab('paste')}>Paste Text</button>
            <button style={tabStyle(tab === 'upload')} onClick={() => setTab('upload')}>Upload PDF</button>
          </div>

          {tab === 'paste' ? (
            <div>
              <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your full resume text here..." rows={10} style={inputStyle} />
              <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>{wordCount(resumeText)} words</p>
            </div>
          ) : (
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: resumeFile ? 'rgba(99,102,241,0.08)' : 'transparent', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 0.75rem', display: 'block', color: '#6366f1' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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

        <div className="card">
          <h3 style={{ color: '#f1f5f9', marginBottom: '0.75rem', fontSize: '1rem' }}>Job Description</h3>
          <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste the full job description here..." rows={8} style={inputStyle} />
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>{wordCount(jdText)} words</p>
        </div>

        <div><CooldownButton onClick={handleAnalyze}>Analyze Resume</CooldownButton></div>
      </div>

      {result && (
        <div style={{ marginTop: '2.5rem', display: 'grid', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
            <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem' }}>ATS Match Score</h3>
            <CircularProgress score={result.score ?? 0} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card">
              <h4 style={{ color: '#4ade80', marginBottom: '0.75rem', fontSize: '0.9rem' }}>✓ Matched Keywords</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(result.matched_keywords || []).map(k => (
                  <span key={k} style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '0.375rem', padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}>{k}</span>
                ))}
                {!(result.matched_keywords?.length) && <span style={{ color: '#64748b', fontSize: '0.85rem' }}>None found</span>}
              </div>
            </div>
            <div className="card">
              <h4 style={{ color: '#ef4444', marginBottom: '0.75rem', fontSize: '0.9rem' }}>✗ Missing Keywords</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(result.missing_keywords || []).map(k => (
                  <span key={k} style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.375rem', padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}>{k}</span>
                ))}
                {!(result.missing_keywords?.length) && <span style={{ color: '#64748b', fontSize: '0.85rem' }}>None missing!</span>}
              </div>
            </div>
          </div>

          {result.fromApi && result.section_breakdown && (
            <div className="card">
              <h4 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Section Breakdown</h4>
              {Object.entries(result.section_breakdown).map(([section, score]) => (
                <div key={section} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#94a3b8', textTransform: 'capitalize', fontSize: '0.875rem' }}>{section}</span>
                    <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>{score}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', height: '6px' }}>
                    <div style={{ height: '6px', borderRadius: '9999px', width: `${score}%`, background: 'linear-gradient(90deg,#6366f1,#a855f7)', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.suggestions?.length > 0 && (
            <div className="card">
              <h4 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>💡 Improvement Suggestions</h4>
              <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                {result.suggestions.map((s, i) => (
                  <li key={i} style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>{s}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
