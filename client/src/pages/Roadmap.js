import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Roadmap() {
  const { user } = useAuth();
  const [targetRole, setTargetRole] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapId, setRoadmapId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load latest roadmap on mount
  useEffect(() => {
    loadLatest();
  }, []);

  const loadLatest = async () => {
    try {
      const res = await axios.get('/api/roadmap/latest');
      setRoadmap(res.data);
      setRoadmapId(res.data._id);
      setCompletedWeeks(res.data.completedWeeks || []);
      setTargetRole(res.data.targetRole);
    } catch {}
  };

  const generate = async () => {
    if (!targetRole) return;
    setLoading(true); setError('');
    try {
      const res = await axios.post('/api/roadmap/generate', {
        targetRole, hoursPerWeek,
        fieldOfInterest: user?.fieldOfInterest || ''
      });
      setRoadmap(res.data);
      setRoadmapId(res.data._id);
      setCompletedWeeks(res.data.completedWeeks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate roadmap');
    } finally { setLoading(false); }
  };

  const toggleWeek = async (num) => {
    const updated = completedWeeks.includes(num)
      ? completedWeeks.filter(w => w !== num)
      : [...completedWeeks, num];
    setCompletedWeeks(updated);

    // Save to DB
    if (roadmapId) {
      setSaving(true);
      try {
        await axios.put(`/api/roadmap/${roadmapId}/progress`, { completedWeeks: updated });
      } catch {}
      finally { setSaving(false); }
    }
  };

  const progress = roadmap ? Math.round((completedWeeks.length / (roadmap.weeks?.length || 1)) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h1>🗺️ Learning Roadmap</h1>
        <p>Personalized week-by-week plan{user?.fieldOfInterest ? ` for ${user.fieldOfInterest}` : ''} — progress auto-saved</p>
      </div>

      <div className="card" style={{marginBottom:'2rem'}}>
        <div style={{display:'flex',gap:'1rem',alignItems:'flex-end',flexWrap:'wrap'}}>
          <div style={{minWidth:'200px'}}>
            <label style={lStyle}>Field of Interest</label>
            <div style={{padding:'0.7rem 1rem',border:'1px solid #e2e8f0',borderRadius:'8px',background:'#f8fafc',fontSize:'0.9rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
              {user?.fieldOfInterest
                ? <><span className="badge badge-primary">{user.fieldOfInterest}</span><span style={{fontSize:'0.75rem',color:'#94a3b8'}}>(from profile)</span></>
                : <span style={{color:'#94a3b8'}}>Set in Dashboard</span>}
            </div>
          </div>
          <div style={{flex:2,minWidth:'200px'}}>
            <label style={lStyle}>Target Role *</label>
            <input className="input" value={targetRole} onChange={e=>setTargetRole(e.target.value)} placeholder="e.g. Full Stack Developer, ML Engineer" />
          </div>
          <div style={{minWidth:'130px'}}>
            <label style={lStyle}>Hours / week</label>
            <input className="input" type="number" min="1" max="40" value={hoursPerWeek} onChange={e=>setHoursPerWeek(parseInt(e.target.value))} />
          </div>
          <button className="btn btn-primary btn-lg" onClick={generate} disabled={loading||!targetRole}>
            {loading ? <><div className="spinner" style={{width:'16px',height:'16px',borderWidth:'2px'}}></div> Generating...</> : '✨ Generate Roadmap'}
          </button>
        </div>
      </div>

      {error && <div style={{background:'#fee2e2',color:'#991b1b',padding:'0.75rem',borderRadius:'8px',marginBottom:'1rem'}}>{error}</div>}

      {roadmap && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'0.5rem'}}>
            <div>
              <h3>{roadmap.targetRole} Roadmap</h3>
              <p style={{color:'#64748b',fontSize:'0.9rem'}}>
                {roadmap.weeks?.length} weeks · {roadmap.hoursPerWeek}h/week
                {user?.fieldOfInterest ? ` · ${user.fieldOfInterest}` : ''}
                {saving && <span style={{color:'#94a3b8',marginLeft:'0.5rem'}}>💾 saving...</span>}
              </p>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:'1.5rem',fontWeight:800,color:'#2563eb'}}>{progress}%</div>
              <div style={{fontSize:'0.8rem',color:'#64748b'}}>{completedWeeks.length}/{roadmap.weeks?.length} weeks done</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{background:'#e2e8f0',borderRadius:'8px',height:'10px',marginBottom:'2rem'}}>
            <div style={{background:progress===100?'#10b981':'#2563eb',height:'10px',borderRadius:'8px',width:`${progress}%`,transition:'width 0.5s'}}></div>
          </div>

          {progress === 100 && (
            <div style={{background:'#d1fae5',border:'1px solid #6ee7b7',borderRadius:'12px',padding:'1rem',marginBottom:'1.5rem',textAlign:'center'}}>
              <div style={{fontSize:'2rem'}}>🎉</div>
              <div style={{fontWeight:700,color:'#065f46',marginTop:'0.25rem'}}>Roadmap Complete! Congratulations!</div>
            </div>
          )}

          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {roadmap.weeks?.map((week, i) => {
              const done = completedWeeks.includes(week.weekNumber);
              return (
                <div key={i} className="card" style={{borderLeft:`4px solid ${done?'#10b981':'#2563eb'}`,opacity:done?0.85:1,transition:'all 0.2s'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                      <div style={{width:'38px',height:'38px',background:done?'#d1fae5':'#dbeafe',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:700,color:done?'#065f46':'#1d4ed8'}}>
                        {done ? '✓' : `W${week.weekNumber}`}
                      </div>
                      <div>
                        <h4 style={{fontSize:'0.95rem',marginBottom:'0.1rem'}}>{week.title}</h4>
                        <span style={{fontSize:'0.75rem',color:'#94a3b8'}}>Week {week.weekNumber}</span>
                      </div>
                    </div>
                    <button onClick={()=>toggleWeek(week.weekNumber)}
                      className={`btn btn-sm ${done?'btn-success':'btn-secondary'}`}>
                      {done ? '✅ Completed' : 'Mark Done'}
                    </button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.75rem'}}>
                    <div>
                      <div style={{fontSize:'0.78rem',fontWeight:600,color:'#64748b',marginBottom:'0.4rem',textTransform:'uppercase'}}>📖 Topics</div>
                      {week.topics?.map((t,j)=><div key={j} style={{fontSize:'0.85rem',padding:'0.2rem 0',color:'#374151'}}>• {t}</div>)}
                    </div>
                    <div>
                      <div style={{fontSize:'0.78rem',fontWeight:600,color:'#64748b',marginBottom:'0.4rem',textTransform:'uppercase'}}>🔗 Resources</div>
                      {week.resources?.map((r,j)=><div key={j} style={{fontSize:'0.85rem',padding:'0.2rem 0',color:'#374151'}}>• {r}</div>)}
                    </div>
                    <div>
                      <div style={{fontSize:'0.78rem',fontWeight:600,color:'#64748b',marginBottom:'0.4rem',textTransform:'uppercase'}}>🎯 Goals</div>
                      {week.goals?.map((g,j)=><div key={j} style={{fontSize:'0.85rem',padding:'0.2rem 0',color:'#374151'}}>• {g}</div>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!roadmap && !loading && (
        <div style={{textAlign:'center',padding:'4rem',color:'#94a3b8'}}>
          <div style={{fontSize:'3rem'}}>🗺️</div>
          <p style={{fontWeight:600,color:'#64748b',marginTop:'1rem'}}>Enter your target role and generate a personalized roadmap</p>
          <p style={{fontSize:'0.85rem'}}>Your progress will be saved automatically</p>
        </div>
      )}
    </div>
  );
}

const lStyle = {display:'block',fontSize:'0.9rem',fontWeight:500,color:'#374151',marginBottom:'0.4rem'};
