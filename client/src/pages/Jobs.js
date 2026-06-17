import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchRole, setSearchRole] = useState('');
  const [tab, setTab] = useState('jobs');
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);

  useEffect(() => { fetchFieldJobs(); }, [user?.fieldOfInterest, tab]);

  const fetchFieldJobs = async () => {
    setLoading(true); setError('');
    try {
      const field = user?.fieldOfInterest || '';
      const endpoint = tab === 'internships' ? '/api/jobs/internships' : '/api/jobs/my-jobs';
      const params = field ? `?field=${encodeURIComponent(field)}` : '';
      const res = await axios.get(`${endpoint}${params}`);
      setJobs(res.data.jobs || []);
    } catch { setError('Failed to load jobs. Showing fallback results.'); }
    finally { setLoading(false); }
  };

  const searchJobs = async () => {
    if (!searchRole) return;
    setLoading(true); setError('');
    try {
      const res = await axios.get(`/api/jobs/search?role=${encodeURIComponent(searchRole)}`);
      setJobs(res.data.jobs || []);
    } catch { setError('Search failed'); }
    finally { setLoading(false); }
  };

  const saveJob = async (job) => {
    setSavingId(job.link);
    try {
      await axios.post('/api/jobs/save', job);
      setSavedIds(prev => new Set([...prev, job.link]));
    } catch (err) {
      if (err.response?.data?.message === 'Job already saved') setSavedIds(prev => new Set([...prev, job.link]));
    }
    setSavingId(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1>💼 Jobs & Internships</h1>
        <p>Real opportunities via Adzuna{user?.fieldOfInterest ? ` in ${user.fieldOfInterest}` : ''}</p>
      </div>

      {user?.fieldOfInterest && (
        <div style={{background:'#dbeafe',border:'1px solid #93c5fd',borderRadius:'8px',padding:'0.6rem 1rem',marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.88rem'}}>
          <span>🎯</span><span>Showing live jobs for <strong>{user.fieldOfInterest}</strong></span>
          <span style={{marginLeft:'auto',fontSize:'0.8rem',color:'#1d4ed8'}}></span>
        </div>
      )}

      <div className="card" style={{marginBottom:'1.5rem',display:'flex',gap:'1rem',alignItems:'flex-end',flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:'250px'}}>
          <label style={lStyle}>Search by Role</label>
          <input className="input" value={searchRole} onChange={e=>setSearchRole(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchJobs()} placeholder="e.g. React Developer, Data Analyst..." />
        </div>
        <button className="btn btn-primary" onClick={searchJobs} disabled={loading}> Search</button>
        <button className="btn btn-secondary" onClick={fetchFieldJobs} disabled={loading}> My Field</button>
      </div>

      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.5rem'}}>
        {['jobs','internships'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} className="btn" style={{background:tab===t?'#2563eb':'white',color:tab===t?'white':'#374151',border:'1px solid #e2e8f0',textTransform:'capitalize'}}>
            {t==='jobs'?'💼':'🎓'} {t}
          </button>
        ))}
      </div>

      {error && <div style={{background:'#fef3c7',color:'#92400e',padding:'0.75rem',borderRadius:'8px',marginBottom:'1rem',fontSize:'0.88rem'}}>⚠️ {error}</div>}

      {loading ? (
        <div className="loading-container"><div className="spinner"></div><p>Finding live opportunities...</p></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {jobs.length === 0 ? (
            <div style={{textAlign:'center',padding:'3rem',color:'#94a3b8'}}>
              <div style={{fontSize:'3rem'}}>🔍</div>
              <p style={{fontWeight:600,color:'#64748b',marginTop:'1rem'}}>No results found. Try a different search.</p>
            </div>
          ) : jobs.map((job, i) => (
            <div key={i} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',flexWrap:'wrap'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.5rem',flexWrap:'wrap'}}>
                  <h3 style={{fontSize:'1rem'}}>{job.title}</h3>
                  <span className={`badge ${job.type==='internship'?'badge-primary':'badge-success'}`}>{job.type||'job'}</span>
                  <span style={{fontSize:'0.78rem',color:'#64748b',background:'#f1f5f9',padding:'0.2rem 0.5rem',borderRadius:'4px'}}>{job.source}</span>
                </div>
                <div style={{display:'flex',gap:'1.5rem',flexWrap:'wrap',fontSize:'0.875rem',color:'#64748b'}}>
                  <span>🏢 {job.company}</span>
                  {job.location && <span>📍 {job.location}</span>}
                  {job.experience && <span>⏱ {job.experience}</span>}
                  {job.salary && <span style={{color:'#10b981',fontWeight:600}}>💰 {job.salary}</span>}
                </div>
                {job.description && <p style={{fontSize:'0.82rem',color:'#64748b',marginTop:'0.4rem'}}>{job.description}</p>}
              </div>
              <div style={{display:'flex',gap:'0.5rem',flexDirection:'column',alignItems:'flex-end'}}>
                <a href={job.link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Apply →</a>
                <button onClick={()=>saveJob(job)} disabled={savedIds.has(job.link)||savingId===job.link} className="btn btn-secondary btn-sm" style={{fontSize:'0.78rem'}}>
                  {savedIds.has(job.link)?'✅ Saved':'🔖 Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const lStyle = {display:'block',fontSize:'0.9rem',fontWeight:500,color:'#374151',marginBottom:'0.4rem'};
