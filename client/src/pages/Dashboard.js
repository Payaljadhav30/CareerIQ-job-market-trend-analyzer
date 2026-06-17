import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const fieldOptions = ['Full Stack Development','AI/ML','Data Science','DevOps','Cybersecurity','Cloud Computing','Frontend Development','Backend Development','Mobile Development','Blockchain'];
const categoryColors = { Frontend:'#2563eb', Backend:'#7c3aed', Language:'#0891b2', Database:'#059669', DevOps:'#d97706', Cloud:'#dc2626', AI:'#7c3aed', ML:'#0891b2', Framework:'#2563eb', default:'#64748b' };

export default function Dashboard() {
  const { user, updateField } = useAuth();
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedField, setSelectedField] = useState(user?.fieldOfInterest || '');
  const [savingField, setSavingField] = useState(false);

  useEffect(() => {
    const field = user?.fieldOfInterest || '';
    setSelectedField(field);
    fetchSkills(field);
    fetchJobs(field);
  }, [user?.fieldOfInterest]);

  const fetchSkills = async (field) => {
    setLoadingSkills(true);
    try {
      const params = field ? `?field=${encodeURIComponent(field)}` : '';
      const res = await axios.get(`/api/trends/skills${params}`);
      setSkills(res.data.skills || []);
    } catch {}
    finally { setLoadingSkills(false); }
  };

  const fetchJobs = async (field) => {
    setLoadingJobs(true);
    try {
      const params = field ? `?field=${encodeURIComponent(field)}` : '';
      const res = await axios.get(`/api/trends/jobs${params}`);
      setJobs(res.data.jobs?.slice(0,5) || []);
    } catch {}
    finally { setLoadingJobs(false); }
  };

  const handleFieldChange = async (e) => {
    const f = e.target.value;
    setSelectedField(f);
    setSavingField(true);
    try { await updateField(f); fetchSkills(f); fetchJobs(f); } catch {}
    finally { setSavingField(false); }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div style={{background:'white',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'0.75rem',fontSize:'0.82rem',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
          <div style={{fontWeight:700,marginBottom:'0.25rem'}}>{d.skill}</div>
          <div style={{color:'#64748b'}}>Demand: <strong style={{color:'#2563eb'}}>{d.demand}%</strong></div>
          <div style={{color:'#64748b'}}>Growth: <strong style={{color:'#10b981'}}>{d.growth}</strong></div>
          <div style={{color:'#94a3b8',fontSize:'0.75rem'}}>{d.category}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="page-header">
        <h1>📊 Dashboard</h1>
        <p>Welcome back, <strong>{user?.name}</strong>! Here's your career overview.</p>
      </div>

      {/* Field Selector */}
      <div className="card" style={{marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:'220px'}}>
          <label style={{fontSize:'0.9rem',fontWeight:500,color:'#374151',display:'block',marginBottom:'0.3rem'}}>
            🎯 Field of Interest {savingField && <span style={{color:'#94a3b8',fontSize:'0.75rem'}}>(saving...)</span>}
          </label>
          <select className="select" value={selectedField} onChange={handleFieldChange}>
            <option value="">Select your field...</option>
            {fieldOptions.map(f=><option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        {user?.fieldOfInterest && (
          <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
            {[{label:'Resume', path:'/resume', icon:'📄'},{label:'Courses', path:'/courses', icon:'📚'},{label:'Roadmap', path:'/roadmap', icon:'🗺️'},{label:'Jobs', path:'/jobs', icon:'💼'}].map(l=>(
              <Link key={l.path} to={l.path} className="btn btn-secondary btn-sm">{l.icon} {l.label}</Link>
            ))}
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid-3" style={{marginBottom:'1.5rem'}}>
        {[
          {label:'Top Skill Demand', value: skills[0]?.demand ? `${skills[0].demand}%` : '—', icon:'⚡', sub: skills[0]?.skill || 'Load a field'},
          {label:'Fastest Growing', value: skills.reduce((a,b)=>parseInt(a.growth||'0')>parseInt(b.growth||'0')?a:b,{})?.skill || '—', icon:'🚀', sub: skills.reduce((a,b)=>parseInt(a.growth||'0')>parseInt(b.growth||'0')?a:b,{})?.growth || ''},
          {label:'Live Jobs Found', value: jobs.length || '—', icon:'💼', sub: jobs.length ? 'via Adzuna API' : 'Select a field'},
        ].map(s=>(
          <div key={s.label} className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'0.25rem'}}>{s.icon}</div>
            <div style={{fontSize:'1.6rem',fontWeight:800,color:'#2563eb'}}>{s.value}</div>
            <div style={{fontSize:'0.8rem',color:'#374151',fontWeight:600}}>{s.label}</div>
            <div style={{fontSize:'0.75rem',color:'#94a3b8'}}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{alignItems:'flex-start'}}>
        {/* Skills Chart */}
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
            <h3 style={{fontSize:'1rem'}}>📈 In-Demand Skills</h3>
            {selectedField && <span className="badge badge-primary">{selectedField}</span>}
          </div>
          {loadingSkills ? (
            <div className="loading-container" style={{padding:'2rem'}}><div className="spinner"></div></div>
          ) : skills.length === 0 ? (
            <div style={{textAlign:'center',padding:'2rem',color:'#94a3b8'}}>Select a field to see skill trends</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={skills} layout="vertical" margin={{left:8,right:24,top:4,bottom:4}}>
                  <XAxis type="number" domain={[0,100]} tick={{fontSize:11}} tickFormatter={v=>`${v}%`} />
                  <YAxis type="category" dataKey="skill" tick={{fontSize:11}} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="demand" radius={[0,6,6,0]}>
                    {skills.map((entry,i)=>(
                      <Cell key={i} fill={categoryColors[entry.category] || categoryColors.default} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem',marginTop:'0.75rem'}}>
                {[...new Set(skills.map(s=>s.category))].map(cat=>(
                  <span key={cat} style={{display:'inline-flex',alignItems:'center',gap:'0.3rem',fontSize:'0.72rem',color:'#64748b'}}>
                    <span style={{width:'8px',height:'8px',borderRadius:'50%',background:categoryColors[cat]||categoryColors.default,display:'inline-block'}}></span>{cat}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Live Jobs */}
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
            <h3 style={{fontSize:'1rem'}}>💼 Live Jobs</h3>
            <Link to="/jobs" className="btn btn-secondary btn-sm">View All →</Link>
          </div>
          {loadingJobs ? (
            <div className="loading-container" style={{padding:'2rem'}}><div className="spinner"></div></div>
          ) : jobs.length === 0 ? (
            <div style={{textAlign:'center',padding:'2rem',color:'#94a3b8'}}>Select a field to see live jobs</div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {jobs.map((job,i)=>(
                <a key={i} href={job.link} target="_blank" rel="noreferrer" style={{textDecoration:'none',display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'0.75rem',background:'#f8fafc',borderRadius:'8px',border:'1px solid #e2e8f0',gap:'0.75rem',transition:'background 0.15s'}} onMouseEnter={e=>e.currentTarget.style.background='#f1f5f9'} onMouseLeave={e=>e.currentTarget.style.background='#f8fafc'}>
                  <div>
                    <div style={{fontWeight:600,fontSize:'0.88rem',color:'#0f172a',marginBottom:'0.2rem'}}>{job.title}</div>
                    <div style={{fontSize:'0.78rem',color:'#64748b'}}>🏢 {job.company} · 📍 {job.location||'India'}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    {job.salary && <div style={{fontSize:'0.8rem',fontWeight:600,color:'#10b981'}}>{job.salary}</div>}
                    <span style={{fontSize:'0.72rem',color:'#94a3b8'}}>{job.source}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{marginTop:'1.5rem'}}>
        <h3 style={{marginBottom:'1rem',fontSize:'1rem'}}>⚡ Quick Actions</h3>
        <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
          {[
            {path:'/resume',icon:'📄',label:'Analyze Resume',desc:'Upload & get AI feedback'},
            {path:'/interview',icon:'🎤',label:'Practice Interview',desc:'2-min timer per question'},
            {path:'/community',icon:'👥',label:'Ask Community',desc:'Get help from peers'},
            {path:'/profile',icon:'👤',label:'Edit Profile',desc:'Update skills & field'},
          ].map(a=>(
            <Link key={a.path} to={a.path} style={{textDecoration:'none',flex:'1',minWidth:'160px'}}>
              <div className="card" style={{textAlign:'center',padding:'1rem',cursor:'pointer',border:'1px solid #e2e8f0',transition:'box-shadow 0.2s'}} onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 12px rgba(37,99,235,0.12)'} onMouseLeave={e=>e.currentTarget.style.boxShadow=''}>
                <div style={{fontSize:'1.8rem',marginBottom:'0.25rem'}}>{a.icon}</div>
                <div style={{fontWeight:600,fontSize:'0.88rem',color:'#374151'}}>{a.label}</div>
                <div style={{fontSize:'0.75rem',color:'#94a3b8'}}>{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
