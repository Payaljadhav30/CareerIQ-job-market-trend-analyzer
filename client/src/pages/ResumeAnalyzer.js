import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const [mode, setMode] = useState('pdf');
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [latestLoaded, setLatestLoaded] = useState(false);
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');

  useEffect(() => { loadLatest(); }, []);

  const loadLatest = async () => {
    try {
      const res = await axios.get('/api/resume/latest');
      setAnalysis(res.data.analysis);
      setTargetRole(res.data.targetRole || '');
      setLatestLoaded(true);
    } catch {}
  };

  const handlePDFUpload = async () => {
    if (!file) { setError('Please select a file'); return; }
    if (!targetRole) { setError('Please enter a target role'); return; }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) { setError('File too large. Max 5MB.'); return; }
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) { setError('Only PDF, DOC, DOCX files allowed'); return; }
    setLoading(true); setError('');
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);
    formData.append('fieldOfInterest', user?.fieldOfInterest || 'Software Development');
    try {
      const res = await axios.post('/api/resume/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAnalysis(res.data.analysis);
      setLatestLoaded(true);
    } catch (err) { setError(err.response?.data?.message || 'Analysis failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleTextAnalyze = async () => {
    if (!skills.trim()) { setError('Please enter at least your skills'); return; }
    if (!targetRole) { setError('Please enter a target role'); return; }
    setLoading(true); setError('');
    try {
      const res = await axios.post('/api/resume/analyze-text', {
        skills, experience, education, targetRole,
        fieldOfInterest: user?.fieldOfInterest || 'Software Development'
      });
      setAnalysis(res.data.analysis);
      setLatestLoaded(true);
    } catch (err) { setError(err.response?.data?.message || 'Analysis failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>📄 Resume Analyzer</h1>
        <p>AI-powered analysis{user?.fieldOfInterest ? ` for ${user.fieldOfInterest}` : ''} — history auto-saved</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div className="card">

          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f1f5f9', borderRadius: '10px', padding: '0.3rem' }}>
            <button onClick={() => { setMode('pdf'); setError(''); }}
              style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', background: mode === 'pdf' ? 'white' : 'transparent', color: mode === 'pdf' ? '#2563eb' : '#64748b', boxShadow: mode === 'pdf' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
              📄 Upload Resume
            </button>
            <button onClick={() => { setMode('text'); setError(''); }}
              style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', background: mode === 'text' ? 'white' : 'transparent', color: mode === 'text' ? '#2563eb' : '#64748b', boxShadow: mode === 'text' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
              ✍️ Enter Skills Manually
            </button>
          </div>

          {user?.fieldOfInterest && (
            <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
              <span>🎯</span><span>Analyzing for <strong>{user.fieldOfInterest}</strong></span>
            </div>
          )}

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>{error}</div>
          )}

          {/* Common - Target Role */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={lStyle}>Target Role *</label>
            <input className="input" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. React Developer, Data Scientist" />
          </div>

          {/* PDF MODE */}
          {mode === 'pdf' && (
            <div>
              <label style={lStyle}>Resume File * <span style={{ color: '#94a3b8' }}>(PDF/DOC/DOCX, max 5MB)</span></label>
              <div style={{ border: '2px dashed #e2e8f0', borderRadius: '10px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: '#f8fafc', transition: 'border-color 0.2s', marginBottom: '1rem' }}
                onClick={() => document.getElementById('resumeFile').click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#2563eb'; }}
                onDragLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#e2e8f0'; if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}>
                <input id="resumeFile" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                {file ? (
                  <><div style={{ fontSize: '1.5rem' }}>📄</div><div style={{ fontWeight: 600, color: '#374151', marginTop: '0.5rem' }}>{file.name}</div><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</div></>
                ) : (
                  <><div style={{ fontSize: '2rem' }}>⬆️</div><div style={{ fontWeight: 500, color: '#64748b', marginTop: '0.5rem' }}>Click to upload or drag & drop</div><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>PDF, DOC, DOCX up to 5MB</div></>
                )}
              </div>
              <button className="btn btn-primary btn-lg" onClick={handlePDFUpload} disabled={loading || !file || !targetRole} style={{ justifyContent: 'center', width: '100%' }}>
                {loading ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> Analyzing...</> : '🔍 Analyze Resume'}
              </button>
            </div>
          )}

          {/* TEXT MODE */}
          {mode === 'text' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem', fontSize: '0.85rem', color: '#166534' }}>
                💡 No resume? No problem! Just tell us your skills and we'll analyze your profile.
              </div>
              <div>
                <label style={lStyle}>Your Skills * <span style={{ color: '#94a3b8' }}>(comma separated)</span></label>
                <textarea className="textarea" value={skills} onChange={e => setSkills(e.target.value)}
                  placeholder="e.g. Python, React, Node.js, SQL, Machine Learning, Git, REST APIs..."
                  style={{ minHeight: '90px' }} />
              </div>
              <div>
                <label style={lStyle}>Experience <span style={{ color: '#94a3b8' }}>(optional)</span></label>
                <textarea className="textarea" value={experience} onChange={e => setExperience(e.target.value)}
                  placeholder="e.g. Built 2 React projects, 3 months internship at startup..."
                  style={{ minHeight: '70px' }} />
              </div>
              <div>
                <label style={lStyle}>Education <span style={{ color: '#94a3b8' }}>(optional)</span></label>
                <input className="input" value={education} onChange={e => setEducation(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science, 3rd year, CGPA 8.2" />
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleTextAnalyze} disabled={loading || !skills.trim() || !targetRole} style={{ justifyContent: 'center', width: '100%' }}>
                {loading ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> Analyzing...</> : '✨ Analyze My Skills'}
              </button>
            </div>
          )}

          {latestLoaded && (
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.75rem' }}>
              ↑ Showing latest analysis · All analyses saved in Profile
            </p>
          )}
        </div>

        {/* Analysis Results */}
        {analysis ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ textAlign: 'center', borderTop: `4px solid ${analysis.skillMatchPercentage >= 70 ? '#10b981' : analysis.skillMatchPercentage >= 50 ? '#f59e0b' : '#ef4444'}` }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: analysis.skillMatchPercentage >= 70 ? '#10b981' : analysis.skillMatchPercentage >= 50 ? '#f59e0b' : '#ef4444' }}>{analysis.skillMatchPercentage}%</div>
              <div style={{ color: '#64748b' }}>Skill Match Score</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                {analysis.skillMatchPercentage >= 70 ? 'Strong Match! 🎉' : analysis.skillMatchPercentage >= 50 ? 'Good Start 👍' : 'Needs Improvement 💪'}
              </div>
            </div>

            {analysis.extractedSkills?.length > 0 && (
              <div className="card">
                <h4 style={{ marginBottom: '0.75rem', color: '#10b981' }}>✅ Your Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {analysis.extractedSkills.map((s, i) => <span key={i} className="badge badge-success">{s}</span>)}
                </div>
              </div>
            )}

            {analysis.missingSkills?.length > 0 && (
              <div className="card">
                <h4 style={{ marginBottom: '0.75rem', color: '#ef4444' }}>❌ Missing Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {analysis.missingSkills.map((s, i) => <span key={i} className="badge badge-danger">{s}</span>)}
                </div>
              </div>
            )}

            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div className="card">
                <h4 style={{ marginBottom: '0.75rem', color: '#10b981', fontSize: '0.9rem' }}>💪 Strengths</h4>
                {analysis.strengths?.map((s, i) => <div key={i} style={{ fontSize: '0.85rem', padding: '0.2rem 0', borderBottom: '1px solid #f1f5f9', color: '#374151' }}>• {s}</div>)}
              </div>
              <div className="card">
                <h4 style={{ marginBottom: '0.75rem', color: '#f59e0b', fontSize: '0.9rem' }}>⚠️ Weaknesses</h4>
                {analysis.weaknesses?.map((s, i) => <div key={i} style={{ fontSize: '0.85rem', padding: '0.2rem 0', borderBottom: '1px solid #f1f5f9', color: '#374151' }}>• {s}</div>)}
              </div>
            </div>

            <div className="card">
              <h4 style={{ marginBottom: '0.75rem', color: '#2563eb' }}>💡 Suggestions</h4>
              {analysis.suggestions?.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 700, color: '#2563eb', minWidth: '20px' }}>{i + 1}.</span>
                  <span style={{ fontSize: '0.88rem', color: '#374151' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '3rem' }}>📊</div>
            <p style={{ fontWeight: 600, color: '#64748b', marginTop: '1rem' }}>Upload your resume or enter your skills to see analysis</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>No resume? Switch to "Enter Skills Manually" tab</p>
          </div>
        )}
      </div>
    </div>
  );
}

const lStyle = { display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#374151', marginBottom: '0.4rem' };