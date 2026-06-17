import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const fields = ['Full Stack Development', 'AI/ML', 'Data Science', 'DevOps', 'Cybersecurity', 'Cloud Computing', 'Frontend Development', 'Backend Development', 'Mobile Development', 'Blockchain'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', fieldOfInterest: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, updateField } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      if (form.fieldOfInterest) await updateField(form.fieldOfInterest);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🎯 <span>CareerIQ</span></div>
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.subtitle}>Start your AI-powered career journey</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Full Name</label>
            <input className="input" type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label style={styles.label}>Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div>
            <label style={styles.label}>Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength="6" />
          </div>
          <div>
            <label style={styles.label}>Field of Interest <span style={{color:'#94a3b8'}}>(optional)</span></label>
            <select className="select" value={form.fieldOfInterest} onChange={e => setForm({...form, fieldOfInterest: e.target.value})}>
              <option value="">Select your field...</option>
              {fields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center'}}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={styles.footer}>Already have an account? <Link to="/login" style={{color:'#2563eb'}}>Sign in</Link></p>
        <p style={{...styles.footer, marginTop:'0.5rem'}}><Link to="/landing" style={{color:'#94a3b8',fontSize:'0.85rem'}}>← Back to Home</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: {minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8fafc',padding:'2rem'},
  card: {background:'white',padding:'2.5rem',borderRadius:'16px',border:'1px solid #e2e8f0',width:'100%',maxWidth:'440px',boxShadow:'0 4px 24px rgba(0,0,0,0.08)'},
  logo: {display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'1.4rem',fontFamily:'Sora,sans-serif',fontWeight:700,color:'#0f172a',marginBottom:'1.5rem'},
  title: {fontSize:'1.6rem',color:'#0f172a',marginBottom:'0.25rem'},
  subtitle: {color:'#64748b',marginBottom:'1.5rem'},
  error: {background:'#fee2e2',color:'#991b1b',padding:'0.75rem',borderRadius:'8px',marginBottom:'1rem',fontSize:'0.9rem'},
  form: {display:'flex',flexDirection:'column',gap:'1rem'},
  label: {display:'block',fontSize:'0.9rem',fontWeight:500,color:'#374151',marginBottom:'0.4rem'},
  footer: {textAlign:'center',marginTop:'1.5rem',color:'#64748b',fontSize:'0.9rem'}
};
