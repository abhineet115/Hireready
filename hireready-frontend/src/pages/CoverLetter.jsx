import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateCoverLetter, uploadResume, isBackendOffline } from '../services/api';
import CooldownButton from '../components/CooldownButton';
import PricingModal from '../components/PricingModal';

const TONES = ['professional', 'enthusiastic', 'formal', 'conversational'];

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)',
  borderRadius: '0.5rem', color: '#f1f5f9', padding: '0.75rem', fontSize: '0.875rem',
  resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
};

export default function CoverLetter() {
  const { user, userType, getIdToken, loginWithGoogle } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [tone, setTone] = useState('professional');
  const [tab, setTab] = useState('paste');
  const [resumeFile, setResumeFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const tabStyle = (active) => ({
    padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer',
    borderRadius: '0.375rem', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
    background: active ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'transparent',
    color: active ? '#fff' : '#94a3b8',
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File exceeds 5MB limit.'); return; }
    setResumeFile(file);
    setError('');
  };

  const handleGenerate = async () => {
    if (userType !== 'pro') { setShowPricing(true); return; }
    setError('');
    setResult(null);
    setCopied(false);
    let finalText = resumeText;

    if (tab === 'upload' && resumeFile) {
      try {
        const token = await getIdToken();
        const uploadRes = await uploadResume(resumeFile, token);
        finalText = uploadRes.text || '';
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
      const data = await generateCoverLetter(finalText, jdText, tone, token);
      setResult(data);
    } catch (err) {
      if (isBackendOffline()) {
        setOffline(true);
        setError('Backend is offline — cannot generate cover letter.');
      } else {
        setError(err.message || 'Generation failed. Please try again.');
      }
    }
  };

  const handleCopy = async () => {
    if (!result?.cover_letter) return;
    try {
      await navigator.clipboard.writeText(result.cover_letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  if (!user) {
    return (
      <div className="page-container" style={{ paddingTop: '4rem', paddingBottom: '3rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto', padding: '2.5rem 2rem' }}>
          <h2 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>Sign in to use Cover Letter Generator</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>This is a PRO feature. Sign in to get started.</p>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={loginWithGoogle}>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div>
          <h1 className="section-title">Cover Letter Generator</h1>
          <p className="section-subtitle">Generate a tailored, compelling cover letter in seconds.</p>
        </div>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#22d3ee,#a855f7)', color: '#fff', alignSelf: 'center' }}>PRO</span>
      </div>

      {offline && (
        <div style={{ margin: '1rem 0', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', fontSize: '0.875rem' }}>
          ⚠️ Backend is offline — functionality unavailable.
        </div>
      )}
      {error && (
        <div style={{ margin: '1rem 0', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {userType !== 'pro' && (
        <div style={{ margin: '1rem 0', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>🔒 This is a PRO feature. Upgrade to unlock Cover Letter Generator.</span>
          <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => setShowPricing(true)}>Upgrade to PRO</button>
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
            <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your full resume text here..." rows={8} style={inputStyle} />
          ) : (
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
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

        <div className="card">
          <h3 style={{ color: '#f1f5f9', marginBottom: '0.75rem', fontSize: '1rem' }}>Job Description</h3>
          <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste the full job description here..." rows={8} style={inputStyle} />
        </div>

        <div className="card">
          <h3 style={{ color: '#f1f5f9', marginBottom: '0.75rem', fontSize: '1rem' }}>Tone</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t)} style={{
                padding: '0.4rem 1rem', border: '1px solid', borderRadius: '0.375rem', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 500, textTransform: 'capitalize', transition: 'all 0.2s',
                borderColor: tone === t ? '#6366f1' : 'rgba(99,102,241,0.2)',
                background: tone === t ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: tone === t ? '#a5b4fc' : '#94a3b8',
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div><CooldownButton onClick={handleGenerate}>{userType !== 'pro' ? '🔒 Upgrade to Generate' : 'Generate Cover Letter'}</CooldownButton></div>
      </div>

      {result && (
        <div style={{ marginTop: '2.5rem', display: 'grid', gap: '1.5rem' }}>
          {result.subject_line && (
            <div className="card">
              <h4 style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Email Subject Line</h4>
              <p style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 600, margin: 0 }}>{result.subject_line}</p>
            </div>
          )}

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ color: '#f1f5f9', margin: 0 }}>Cover Letter</h4>
              <button onClick={handleCopy} style={{
                background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(99,102,241,0.1)',
                border: `1px solid ${copied ? 'rgba(74,222,128,0.4)' : 'rgba(99,102,241,0.3)'}`,
                borderRadius: '0.375rem', padding: '0.35rem 0.75rem',
                color: copied ? '#4ade80' : '#a5b4fc', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s',
              }}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', padding: '1.25rem', border: '1px solid rgba(99,102,241,0.1)' }}>
              {result.cover_letter}
            </div>
          </div>

          {result.key_selling_points?.length > 0 && (
            <div className="card">
              <h4 style={{ color: '#f1f5f9', marginBottom: '0.75rem' }}>⭐ Key Selling Points</h4>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                {result.key_selling_points.map((pt, i) => (
                  <li key={i} style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.4rem' }}>{pt}</li>
                ))}
              </ul>
            </div>
          )}

          {result.customization_tips?.length > 0 && (
            <div className="card">
              <h4 style={{ color: '#f1f5f9', marginBottom: '0.75rem' }}>💡 Customization Tips</h4>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                {result.customization_tips.map((tip, i) => (
                  <li key={i} style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.4rem' }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
