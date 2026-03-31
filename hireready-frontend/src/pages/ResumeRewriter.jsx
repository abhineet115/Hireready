import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { rewriteResume, uploadResume, isBackendOffline } from '../services/api';
import PricingModal from '../components/PricingModal';
import CooldownButton from '../components/CooldownButton';

export default function ResumeRewriter() {
  const { getIdToken, isPro, devMode } = useAuth();
  const [tab, setTab] = useState('paste');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [jdText, setJdText] = useState('');
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

  const handleRewrite = async () => {
    setError('');
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
          setError('Upload failed. Please paste text instead.');
          return;
        }
      }
    }
    if (!finalText.trim()) { setError('Please provide your resume text.'); return; }
    if (!jdText.trim()) { setError('Please provide the job description.'); return; }

    try {
      const token = await getIdToken();
      const data = await rewriteResume(finalText, jdText, token);
      setResult(data);
    } catch (err) {
      if (isBackendOffline()) {
        setOffline(true);
        setResult({
          summary: 'Your resume has been analyzed against the job description. Several improvements were identified to better align your experience with the role requirements and increase your ATS match score.',
          rewrites: [
            { original: 'Worked on various projects and helped the team deliver features.', rewrite: 'Led delivery of 5+ cross-functional features, reducing time-to-ship by 20% through structured sprint planning.', reason: 'Added quantifiable impact and active ownership language.' },
            { original: 'Good communication and teamwork skills.', rewrite: 'Facilitated daily standups and cross-team alignment meetings, improving cross-department collaboration and sprint velocity by 15%.', reason: 'Replaced generic soft skill mention with concrete, measurable contribution.' },
            { original: 'Responsible for maintaining the codebase.', rewrite: 'Maintained and refactored legacy codebase (50k+ lines), achieving 35% reduction in bug reports over 6 months.', reason: 'Quantified the scope and outcome of the work.' },
          ],
        });
      } else {
        setError(err.message || 'Rewrite failed. Please try again.');
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
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Resume Rewriter is available to PRO members. Upgrade to unlock AI-powered resume rewrites tailored to each job.</p>
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
      <h1 className="section-title">Resume Rewriter</h1>
      <p className="section-subtitle">AI rewrites your resume bullets to match the job description perfectly.</p>

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
            <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your resume text here..." rows={10} style={inputStyle} />
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
          <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste the job description here..." rows={8} style={inputStyle} />
        </div>

        <div><CooldownButton onClick={handleRewrite}>Rewrite Resume</CooldownButton></div>
      </div>

      {result && (
        <div style={{ marginTop: '2.5rem', display: 'grid', gap: '1.5rem' }}>
          {result.summary && (
            <div className="card" style={{ borderLeft: '3px solid #6366f1' }}>
              <h4 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>Overall Summary</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>{result.summary}</p>
            </div>
          )}
          {result.rewrites?.map((item, i) => (
            <div key={i} className="card" style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <span style={{ display: 'inline-block', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.375rem', padding: '0.15rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem' }}>Original</span>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.05)', borderRadius: '0.375rem' }}>{item.original}</p>
              </div>
              <div>
                <span style={{ display: 'inline-block', background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '0.375rem', padding: '0.15rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem' }}>AI Rewrite</span>
                <p style={{ color: '#f1f5f9', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, padding: '0.5rem 0.75rem', background: 'rgba(74,222,128,0.05)', borderRadius: '0.375rem' }}>{item.rewrite}</p>
              </div>
              <div>
                <span style={{ display: 'inline-block', background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '0.375rem', padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.4rem' }}>Reason</span>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
