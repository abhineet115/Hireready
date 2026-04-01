import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserHistory } from '../services/api';

const TOOL_ROUTES = {
  'ATS Scorer': '/ats-scorer',
  'Interview Predictor': '/interview-predictor',
  'Role Recommender': '/role-recommender',
  'Resume Rewriter': '/resume-rewriter',
  'Salary Negotiator': '/salary-negotiator',
  'Advanced Prep': '/advanced-prep',
  'Cover Letter': '/cover-letter',
};

const TOOL_COLORS = {
  'ATS Scorer': '#6366f1',
  'Interview Predictor': '#a855f7',
  'Role Recommender': '#22d3ee',
  'Resume Rewriter': '#f59e0b',
  'Salary Negotiator': '#4ade80',
  'Advanced Prep': '#f472b6',
  'Cover Letter': '#fb923c',
};

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const PAGE_SIZE = 10;

export default function History() {
  const { user, loading, loginWithGoogle, getIdToken } = useAuth();
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingData, setLoadingData] = useState(false);
  const [filterTool, setFilterTool] = useState('All');

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const token = await getIdToken();
      const data = await getUserHistory(token);
      setHistory(data.history || []);
    } catch {
      // backend offline — leave empty
    } finally {
      setLoadingData(false);
    }
  }, [user, getIdToken]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, page]);

  if (loading) {
    return <div className="page-container" style={{ paddingTop: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="page-container" style={{ paddingTop: '4rem', paddingBottom: '3rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto', padding: '2.5rem 2rem' }}>
          <h2 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>Sign in to view your history</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Track all your scans and tool usage over time.</p>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={loginWithGoogle}>Continue with Google</button>
        </div>
      </div>
    );
  }

  const tools = ['All', ...Object.keys(TOOL_ROUTES)];
  const filtered = filterTool === 'All' ? history : history.filter(h => h.tool === filterTool);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <h1 className="section-title">Scan History</h1>
      <p className="section-subtitle">Your recent tool usage across all HireReady features.</p>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1.5rem 0 1rem' }}>
        {tools.map(t => (
          <button key={t} onClick={() => { setFilterTool(t); setPage(1); }} style={{
            padding: '0.35rem 0.85rem', border: '1px solid', borderRadius: '9999px', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s',
            borderColor: filterTool === t ? (TOOL_COLORS[t] || '#6366f1') : 'rgba(99,102,241,0.2)',
            background: filterTool === t ? `${TOOL_COLORS[t] || '#6366f1'}22` : 'transparent',
            color: filterTool === t ? (TOOL_COLORS[t] || '#a5b4fc') : '#94a3b8',
          }}>
            {t}
          </button>
        ))}
      </div>

      <div className="card">
        {loadingData ? (
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading history...</p>
        ) : paginated.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {paginated.map((item, i) => {
              const color = TOOL_COLORS[item.tool] || '#6366f1';
              const route = TOOL_ROUTES[item.tool];
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: `1px solid ${color}22` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                      {route ? (
                        <Link to={route} style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 600 }}>{item.tool || 'Scan'}</Link>
                      ) : (
                        <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 600 }}>{item.tool || 'Scan'}</span>
                      )}
                    </div>
                    {item.result_preview && <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0 0 0 1.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '500px' }}>{item.result_preview}</p>}
                    {item.input_preview && <p style={{ color: '#475569', fontSize: '0.75rem', margin: '0.1rem 0 0 1.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '500px' }}>Input: {item.input_preview}</p>}
                  </div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap', marginLeft: '1rem', flexShrink: 0 }}>{relativeTime(item.timestamp)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
              No history yet.{' '}
              <Link to="/ats-scorer" style={{ color: '#6366f1' }}>Start with ATS Scorer!</Link>
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.35rem 0.75rem', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '0.375rem', background: 'transparent', color: page === 1 ? '#475569' : '#a5b4fc', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>
              ← Prev
            </button>
            <span style={{ color: '#64748b', fontSize: '0.85rem', alignSelf: 'center' }}>{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.35rem 0.75rem', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '0.375rem', background: 'transparent', color: page === totalPages ? '#475569' : '#a5b4fc', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>
              Next →
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem', textAlign: 'right' }}>
        <Link to="/dashboard" style={{ color: '#6366f1', fontSize: '0.875rem' }}>← Back to Dashboard</Link>
      </div>
    </div>
  );
}
