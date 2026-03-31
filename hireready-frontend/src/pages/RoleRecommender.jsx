import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { recommendRoles, isBackendOffline } from '../services/api';
import CooldownButton from '../components/CooldownButton';

const TECH_ROLES = [
  { title: 'Full-Stack Software Engineer', description: 'Design and build scalable web applications end-to-end.', salaryRange: '$95k – $145k', demand: 'High', skillsToBuild: ['Cloud infrastructure', 'System design', 'DevOps basics'], why: 'Your technical skill set maps closely to full-stack development, which continues to see strong demand across industries.' },
  { title: 'Backend Engineer', description: 'Build robust APIs and server-side systems at scale.', salaryRange: '$90k – $140k', demand: 'High', skillsToBuild: ['Database optimization', 'Microservices', 'Security fundamentals'], why: 'Your background in programming and system thinking aligns well with backend engineering roles.' },
  { title: 'DevOps / Platform Engineer', description: 'Bridge development and operations through automation and infrastructure.', salaryRange: '$100k – $155k', demand: 'High', skillsToBuild: ['Kubernetes', 'CI/CD pipelines', 'Terraform'], why: 'DevOps engineers are in high demand and your skills translate well to this growing discipline.' },
];
const DATA_ROLES = [
  { title: 'Data Analyst', description: 'Transform raw data into actionable business insights.', salaryRange: '$70k – $110k', demand: 'High', skillsToBuild: ['Advanced SQL', 'Data visualization', 'Statistical modeling'], why: 'Your analytical and data skills make you a strong fit for data analyst positions.' },
  { title: 'Data Engineer', description: 'Build data pipelines and infrastructure for analytics teams.', salaryRange: '$100k – $150k', demand: 'High', skillsToBuild: ['Spark / Kafka', 'Cloud data platforms', 'Data modeling'], why: 'Data engineering is one of the fastest-growing specialties, and your technical background is highly relevant.' },
  { title: 'Business Intelligence Analyst', description: 'Create dashboards and reports to support strategic decisions.', salaryRange: '$75k – $115k', demand: 'Medium', skillsToBuild: ['Power BI / Tableau', 'ETL processes', 'Business acumen'], why: 'Your data skills combined with business context fit well into the BI analyst role.' },
];
const DESIGN_ROLES = [
  { title: 'UX Designer', description: 'Create intuitive user experiences for digital products.', salaryRange: '$80k – $130k', demand: 'Medium', skillsToBuild: ['Figma advanced', 'User research methods', 'Accessibility standards'], why: 'Your design thinking and user empathy align perfectly with UX design career paths.' },
  { title: 'Product Designer', description: 'Own the end-to-end product design process from concept to delivery.', salaryRange: '$90k – $140k', demand: 'High', skillsToBuild: ['Design systems', 'Prototyping', 'Cross-functional collaboration'], why: 'As a product designer you\'ll combine your visual and UX skills with product strategy.' },
  { title: 'UI/Visual Designer', description: 'Craft beautiful, on-brand visual interfaces and design assets.', salaryRange: '$70k – $115k', demand: 'Medium', skillsToBuild: ['Motion design', 'Brand guidelines', 'Component libraries'], why: 'Your eye for aesthetics and design tools mastery directly supports visual design roles.' },
];
const MGMT_ROLES = [
  { title: 'Engineering Manager', description: 'Lead and grow high-performing technical teams.', salaryRange: '$130k – $185k', demand: 'High', skillsToBuild: ['People development', 'Technical roadmapping', 'Executive communication'], why: 'Your leadership skills and technical background position you well for engineering management.' },
  { title: 'Product Manager', description: 'Define product strategy and drive cross-functional execution.', salaryRange: '$100k – $160k', demand: 'High', skillsToBuild: ['OKR frameworks', 'Market research', 'Stakeholder management'], why: 'Your combination of leadership and analytical skills is highly sought after in product management.' },
  { title: 'Scrum Master / Agile Coach', description: 'Facilitate agile ceremonies and remove blockers for delivery teams.', salaryRange: '$85k – $130k', demand: 'Medium', skillsToBuild: ['SAFe certification', 'Conflict resolution', 'Metrics & reporting'], why: 'Your collaborative nature and process orientation make you a natural fit for agile coaching.' },
];
const GENERAL_ROLES = [
  { title: 'Operations Analyst', description: 'Optimize business processes and improve operational efficiency.', salaryRange: '$60k – $95k', demand: 'Medium', skillsToBuild: ['Process mapping', 'Data analysis', 'Project management'], why: 'Your broad skill set and analytical mindset are valuable in operational analysis roles.' },
  { title: 'Project Manager', description: 'Plan, execute, and close projects on time and within budget.', salaryRange: '$75k – $120k', demand: 'High', skillsToBuild: ['PMP certification', 'Risk management', 'Stakeholder communication'], why: 'Project management leverages your organizational skills and ability to coordinate teams.' },
  { title: 'Business Analyst', description: 'Bridge business needs and technical solutions through requirements analysis.', salaryRange: '$70k – $110k', demand: 'Medium', skillsToBuild: ['Requirements elicitation', 'Use case modeling', 'SQL basics'], why: 'Your ability to understand both business and technical domains makes you well-suited for BA roles.' },
];

function getRolePool(skills) {
  const s = skills.join(' ').toLowerCase();
  const isTech = /javascript|python|react|node|java|typescript|golang|rust|php|ruby|c\+\+|swift|kotlin|angular|vue|sql|html|css|aws|docker|kubernetes/.test(s);
  const isData = /data|analytics|tableau|power\s*bi|excel|statistics|machine\s*learning|pandas|numpy|bigquery|spark/.test(s);
  const isDesign = /design|ux|ui|figma|sketch|photoshop|illustrator|user\s*research|wireframe|prototype/.test(s);
  const isMgmt = /management|leadership|agile|scrum|product|strategy|team\s*lead|director|executive/.test(s);
  if (isTech) return TECH_ROLES;
  if (isData) return DATA_ROLES;
  if (isDesign) return DESIGN_ROLES;
  if (isMgmt) return MGMT_ROLES;
  return GENERAL_ROLES;
}

function mockRecommend(currentTitle, skills) {
  const pool = getRolePool(skills);
  const percentages = [85, 78, 71];
  return pool.slice(0, 3).map((role, i) => ({ ...role, matchPct: percentages[i] }));
}

const demandColors = { High: '#4ade80', Medium: '#f59e0b', Low: '#ef4444' };
const rankColors = ['#a855f7', '#6366f1', '#22d3ee'];

export default function RoleRecommender() {
  const { getIdToken } = useAuth();
  const [currentTitle, setCurrentTitle] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed || skills.includes(trimmed) || skills.length >= 10) return;
    setSkills(prev => [...prev, trimmed]);
    setSkillInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  };

  const handleRecommend = async () => {
    setError('');
    if (!currentTitle.trim()) { setError('Please enter your current job title.'); return; }
    if (skills.length < 2) { setError('Please add at least 2 skills.'); return; }
    try {
      const token = await getIdToken();
      const data = await recommendRoles(currentTitle, skills, token);
      setResult(data.roles || data);
    } catch {
      if (isBackendOffline()) {
        setOffline(true);
        setResult(mockRecommend(currentTitle, skills));
      } else {
        setError('Recommendation failed. Please try again.');
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
      <h1 className="section-title">Role Recommender</h1>
      <p className="section-subtitle">Discover career paths that match your skills and experience.</p>

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
          <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.4rem' }}>Current Job Title</label>
          <input type="text" value={currentTitle} onChange={e => setCurrentTitle(e.target.value)} placeholder="e.g. Junior Developer, Marketing Coordinator..." style={inputStyle} />
        </div>
        <div>
          <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.4rem' }}>
            Skills <span style={{ color: '#64748b' }}>({skills.length}/10 — press Enter to add)</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Type a skill and press Enter..."
              style={{ ...inputStyle, flex: 1 }}
              disabled={skills.length >= 10}
            />
            <button onClick={addSkill} className="btn-ghost" style={{ whiteSpace: 'nowrap' }}>Add</button>
          </div>
          {skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' }}>
              {skills.map(s => (
                <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '9999px', padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>
                  {s}
                  <button onClick={() => setSkills(prev => prev.filter(x => x !== s))} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div><CooldownButton onClick={handleRecommend}>Get Recommendations</CooldownButton></div>
      </div>

      {result && (
        <div style={{ marginTop: '2rem', display: 'grid', gap: '1.25rem' }}>
          {result.map((role, i) => (
            <div key={i} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                {/* Rank badge */}
                <div style={{ minWidth: '2.5rem', height: '2.5rem', borderRadius: '50%', background: rankColors[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: '#fff', flexShrink: 0 }}>
                  #{i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <h3 style={{ color: '#f1f5f9', fontSize: '1.05rem', margin: 0 }}>{role.title}</h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: `${demandColors[role.demand]}22`, color: demandColors[role.demand], border: `1px solid ${demandColors[role.demand]}44` }}>
                      {role.demand} Demand
                    </span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.75rem' }}>{role.description}</p>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>SALARY RANGE</span>
                      <p style={{ color: '#4ade80', fontWeight: 600, margin: '0.1rem 0 0', fontSize: '0.9rem' }}>{role.salaryRange}</p>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>MATCH SCORE</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `conic-gradient(${rankColors[i]} ${role.matchPct * 3.6}deg, rgba(255,255,255,0.08) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#12121a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: rankColors[i] }}>{role.matchPct}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(99,102,241,0.06)', borderRadius: '0.5rem', padding: '0.6rem 0.8rem', marginBottom: '0.6rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}><span style={{ color: '#6366f1', fontWeight: 600 }}>Why this fits: </span>{role.why}</p>
                  </div>
                  {role.skillsToBuild?.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.35rem' }}>SKILLS TO BUILD</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {role.skillsToBuild.map(s => (
                          <span key={s} style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '0.375rem', padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
