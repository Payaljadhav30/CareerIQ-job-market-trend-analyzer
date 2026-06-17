import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const platformColors = { YouTube:'#ef4444', Coursera:'#2563eb', Udemy:'#a21caf', freeCodeCamp:'#16a34a', default:'#64748b' };
const difficultyBadge = { Beginner:'badge-success', Intermediate:'badge-warning', Advanced:'badge-danger' };

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [generated, setGenerated] = useState(false);

  // Auto-load if resume exists
  useEffect(() => { if (user?.fieldOfInterest) tryAutoLoad(); }, []);

  const tryAutoLoad = async () => {
    try {
      const res = await axios.get('/api/courses/my-courses');
      setCourses(res.data.courses || []);
      setGenerated(true);
    } catch {}
  };

  const suggestCourses = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.post('/api/courses/suggest', {
        fieldOfInterest: user?.fieldOfInterest || 'Software Development',
        targetRole: targetRole || user?.fieldOfInterest || 'Developer'
      });
      setCourses(res.data.courses || []);
      setGenerated(true);
    } catch (err) { setError(err.response?.data?.message || 'Failed to get course suggestions'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>📚 Course Recommendations</h1>
        <p>Curated courses with real search links </p>
      </div>

      <div className="card" style={{marginBottom:'1.5rem',display:'flex',gap:'1rem',alignItems:'flex-end',flexWrap:'wrap'}}>
        <div style={{display:'flex',flexDirection:'column',gap:'0.3rem',minWidth:'200px'}}>
          <label style={lStyle}>Your Field</label>
          <div style={{padding:'0.7rem 1rem',border:'1px solid #e2e8f0',borderRadius:'8px',background:'#f8fafc',fontSize:'0.9rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
            {user?.fieldOfInterest
              ? <span className="badge badge-primary">{user.fieldOfInterest}</span>
              : <span style={{color:'#94a3b8'}}>Set in Dashboard first</span>}
          </div>
        </div>
        <div style={{flex:1,minWidth:'220px'}}>
          <label style={lStyle}>Target Role <span style={{color:'#94a3b8'}}>(optional)</span></label>
          <input className="input" value={targetRole} onChange={e=>setTargetRole(e.target.value)} placeholder="e.g. Senior React Developer, ML Engineer" />
        </div>
        <button className="btn btn-primary btn-lg" onClick={suggestCourses} disabled={loading||!user?.fieldOfInterest}>
          {loading ? <><div className="spinner" style={{width:'16px',height:'16px',borderWidth:'2px'}}></div> Finding Courses...</> : '✨ Get Recommendations'}
        </button>
      </div>

      {error && <div style={{background:'#fee2e2',color:'#991b1b',padding:'0.75rem',borderRadius:'8px',marginBottom:'1rem'}}>{error}</div>}

      {!generated && !loading && (
        <div style={{textAlign:'center',padding:'4rem',color:'#94a3b8'}}>
          <div style={{fontSize:'3rem'}}>📚</div>
          <p style={{fontWeight:600,color:'#64748b',marginTop:'1rem'}}>Click "Get Recommendations" to get personalized course suggestions</p>
          <p style={{fontSize:'0.85rem',marginTop:'0.5rem'}}></p>
        </div>
      )}

      {courses.length > 0 && (
        <>
          <div style={{fontSize:'0.85rem',color:'#64748b',marginBottom:'1rem'}}>
            ✅ {courses.length} courses found · Links go to real search results
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'1rem'}}>
            {courses.map((course, i) => (
              <div key={i} className="card" style={{display:'flex',flexDirection:'column',gap:'0.75rem',borderTop:`3px solid ${platformColors[course.platform]||platformColors.default}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'0.5rem'}}>
                  <h3 style={{fontSize:'0.95rem',lineHeight:1.4,flex:1}}>{course.title}</h3>
                  <span className={`badge ${difficultyBadge[course.difficulty]||'badge-primary'}`}>{course.difficulty}</span>
                </div>
                <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                  <span style={{padding:'0.2rem 0.6rem',borderRadius:'6px',fontSize:'0.75rem',fontWeight:600,background:platformColors[course.platform]||platformColors.default,color:'white'}}>{course.platform}</span>
                  {course.skill && <span className="badge badge-primary">{course.skill}</span>}
                  {course.duration && <span style={{fontSize:'0.75rem',color:'#94a3b8'}}>⏱ {course.duration}</span>}
                </div>
                {course.description && <p style={{fontSize:'0.82rem',color:'#64748b',lineHeight:1.5}}>{course.description}</p>}
                <a href={course.link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{alignSelf:'flex-start'}}>
                  🔍 Search on {course.platform} →
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const lStyle = {display:'block',fontSize:'0.9rem',fontWeight:500,color:'#374151',marginBottom:'0.4rem'};
