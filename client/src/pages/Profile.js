import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const fieldOptions = ['Full Stack Development','AI/ML','Data Science','DevOps','Cybersecurity','Cloud Computing','Frontend Development','Backend Development','Mobile Development','Blockchain','Generative AI','UI/UX Design'];

export default function Profile() {
  const { user, updateProfile, toggleDarkMode, darkMode } = useAuth();
  const [form, setForm] = useState({ name: user?.name||'', fieldOfInterest: user?.fieldOfInterest||'', skills: user?.skills?.join(', ')||'', github: user?.github||'', linkedin: user?.linkedin||'' });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [savedJobs, setSavedJobs] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [resumeHistory, setResumeHistory] = useState(null);

  const saveProfile = async () => {
    setSaving(true); setMsg('');
    try {
      await updateProfile(form);
      setMsg('✅ Profile updated successfully!');
    } catch (err) { setMsg('❌ ' + (err.response?.data?.message || 'Failed to update')); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) { setPwMsg('❌ Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { setPwMsg('❌ Password must be at least 6 characters'); return; }
    setPwSaving(true); setPwMsg('');
    try {
      await axios.put('/api/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg('✅ Password changed successfully!');
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) { setPwMsg('❌ ' + (err.response?.data?.message || 'Failed to change password')); }
    finally { setPwSaving(false); }
  };

  const loadSavedJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await axios.get('/api/jobs/saved');
      setSavedJobs(res.data.jobs);
    } catch {}
    finally { setLoadingJobs(false); }
  };

  const unsaveJob = async (jobId) => {
    try {
      await axios.delete(`/api/jobs/save/${jobId}`);
      setSavedJobs(prev => prev.filter(j => j._id !== jobId));
    } catch {}
  };

  const loadResumeHistory = async () => {
    try {
      const res = await axios.get('/api/resume/history');
      setResumeHistory(res.data);
    } catch {}
  };

  return (
    <div>
      <div className="page-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account, preferences and saved items</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',alignItems:'flex-start'}}>
        {/* Profile Info */}
        <div className="card">
          <h3 style={{marginBottom:'1.5rem'}}>Personal Information</h3>
          {msg && <div style={{padding:'0.6rem',borderRadius:'6px',marginBottom:'1rem',background:msg.startsWith('✅')?'#d1fae5':'#fee2e2',color:msg.startsWith('✅')?'#065f46':'#991b1b',fontSize:'0.88rem'}}>{msg}</div>}
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label style={lStyle}>Full Name</label>
              <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            </div>
            <div>
              <label style={lStyle}>Email <span style={{color:'#94a3b8'}}>(cannot change)</span></label>
              <input className="input" value={user?.email||''} disabled style={{background:'#f8fafc',color:'#94a3b8'}} />
            </div>
            <div>
              <label style={lStyle}>Field of Interest</label>
              <select className="select" value={form.fieldOfInterest} onChange={e=>setForm({...form,fieldOfInterest:e.target.value})}>
                <option value="">Select field...</option>
                {fieldOptions.map(f=><option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={lStyle}>Skills <span style={{color:'#94a3b8'}}>(comma separated)</span></label>
              <input className="input" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} placeholder="React, Node.js, Python..." />
            </div>
            <div>
              <label style={lStyle}>GitHub URL</label>
              <input className="input" value={form.github} onChange={e=>setForm({...form,github:e.target.value})} placeholder="https://github.com/username" />
            </div>
            <div>
              <label style={lStyle}>LinkedIn URL</label>
              <input className="input" value={form.linkedin} onChange={e=>setForm({...form,linkedin:e.target.value})} placeholder="https://linkedin.com/in/username" />
            </div>
            <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>{saving?'Saving...':'💾 Save Profile'}</button>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
          {/* Preferences */}
          <div className="card">
            <h3 style={{marginBottom:'1rem'}}>Preferences</h3>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem 0',borderBottom:'1px solid #f1f5f9'}}>
              <div>
                <div style={{fontWeight:500,fontSize:'0.9rem'}}>Dark Mode</div>
                <div style={{fontSize:'0.8rem',color:'#64748b'}}>Switch to dark theme</div>
              </div>
              <button onClick={toggleDarkMode} style={{background:darkMode?'#2563eb':'#e2e8f0',border:'none',borderRadius:'20px',width:'44px',height:'24px',cursor:'pointer',position:'relative',transition:'background 0.2s'}}>
                <span style={{position:'absolute',top:'2px',left:darkMode?'22px':'2px',width:'20px',height:'20px',background:'white',borderRadius:'50%',transition:'left 0.2s',display:'block'}}></span>
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="card">
            <h3 style={{marginBottom:'1rem'}}>Change Password</h3>
            {pwMsg && <div style={{padding:'0.6rem',borderRadius:'6px',marginBottom:'0.75rem',background:pwMsg.startsWith('✅')?'#d1fae5':'#fee2e2',color:pwMsg.startsWith('✅')?'#065f46':'#991b1b',fontSize:'0.88rem'}}>{pwMsg}</div>}
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              <input className="input" type="password" placeholder="Current password" value={pwForm.currentPassword} onChange={e=>setPwForm({...pwForm,currentPassword:e.target.value})} />
              <input className="input" type="password" placeholder="New password" value={pwForm.newPassword} onChange={e=>setPwForm({...pwForm,newPassword:e.target.value})} />
              <input className="input" type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} />
              <button className="btn btn-secondary" onClick={changePassword} disabled={pwSaving}>{pwSaving?'Changing...':'🔒 Change Password'}</button>
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <h3 style={{marginBottom:'1rem'}}>My Stats</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
              {[
                {label:'Skills', value: user?.skills?.length||0, icon:'⚡'},
                {label:'Field', value: user?.fieldOfInterest?.split(' ')[0]||'Not set', icon:'🎯'},
                {label:'Saved Jobs', value: user?.savedJobs?.length||0, icon:'💼'},
                {label:'Member Since', value: user?.createdAt?new Date(user.createdAt).toLocaleDateString('en',{month:'short',year:'numeric'}):'—', icon:'📅'},
              ].map(s=>(
                <div key={s.label} style={{background:'#f8fafc',borderRadius:'8px',padding:'0.75rem',textAlign:'center'}}>
                  <div style={{fontSize:'1.4rem'}}>{s.icon}</div>
                  <div style={{fontWeight:700,color:'#374151'}}>{s.value}</div>
                  <div style={{fontSize:'0.75rem',color:'#94a3b8'}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Jobs */}
      <div className="card" style={{marginTop:'1.5rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <h3>💼 Saved Jobs</h3>
          <button className="btn btn-secondary btn-sm" onClick={loadSavedJobs} disabled={loadingJobs}>{loadingJobs?'Loading...':'Load Saved Jobs'}</button>
        </div>
        {savedJobs === null ? (
          <p style={{color:'#94a3b8',fontSize:'0.9rem'}}>Click "Load Saved Jobs" to see your bookmarked positions</p>
        ) : savedJobs.length === 0 ? (
          <p style={{color:'#94a3b8',fontSize:'0.9rem'}}>No saved jobs yet. Save jobs from the Jobs page!</p>
        ) : savedJobs.map(job => (
          <div key={job._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem 0',borderBottom:'1px solid #f1f5f9'}}>
            <div>
              <div style={{fontWeight:600,fontSize:'0.9rem'}}>{job.title}</div>
              <div style={{fontSize:'0.82rem',color:'#64748b'}}>🏢 {job.company} · 📍 {job.location} · 💰 {job.salary}</div>
            </div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <a href={job.link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Apply →</a>
              <button className="btn btn-secondary btn-sm" onClick={()=>unsaveJob(job._id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      {/* Resume History */}
      <div className="card" style={{marginTop:'1.5rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <h3>📄 Resume History</h3>
          <button className="btn btn-secondary btn-sm" onClick={loadResumeHistory}>Load History</button>
        </div>
        {resumeHistory === null ? (
          <p style={{color:'#94a3b8',fontSize:'0.9rem'}}>Click "Load History" to see all past resume analyses</p>
        ) : resumeHistory.length === 0 ? (
          <p style={{color:'#94a3b8',fontSize:'0.9rem'}}>No resume analyses yet.</p>
        ) : resumeHistory.map((r, i) => (
          <div key={r._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem 0',borderBottom:'1px solid #f1f5f9'}}>
            <div>
              <div style={{fontWeight:600,fontSize:'0.9rem'}}>{r.fileName}</div>
              <div style={{fontSize:'0.82rem',color:'#64748b'}}>{r.targetRole} · {new Date(r.createdAt).toLocaleDateString()} · Match: <strong style={{color:'#2563eb'}}>{r.analysis?.skillMatchPercentage}%</strong></div>
            </div>
            <span className={`badge ${r.analysis?.skillMatchPercentage>=70?'badge-success':r.analysis?.skillMatchPercentage>=50?'badge-warning':'badge-danger'}`}>{r.analysis?.skillMatchPercentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const lStyle = {display:'block',fontSize:'0.9rem',fontWeight:500,color:'#374151',marginBottom:'0.4rem'};
