import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const fieldConfigs = [
  { icon: '🤖', title: 'AI / Machine Learning', growth: '+80%', color: '#7c3aed', keyword: 'machine learning engineer', skills: ['Python', 'TensorFlow', 'PyTorch', 'LLMs'] },
  { icon: '🌐', title: 'Full Stack Development', growth: '+42%', color: '#2563eb', keyword: 'full stack developer', skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'] },
  { icon: '📊', title: 'Data Science', growth: '+45%', color: '#0891b2', keyword: 'data scientist', skills: ['Python', 'SQL', 'Tableau', 'Pandas'] },
  { icon: '☁️', title: 'Cloud Computing', growth: '+55%', color: '#059669', keyword: 'cloud engineer', skills: ['AWS', 'Azure', 'Kubernetes', 'Terraform'] },
  { icon: '🔒', title: 'Cybersecurity', growth: '+48%', color: '#dc2626', keyword: 'cybersecurity analyst', skills: ['Ethical Hacking', 'SIEM', 'Network Security'] },
  { icon: '⚙️', title: 'DevOps', growth: '+50%', color: '#d97706', keyword: 'devops engineer', skills: ['Docker', 'CI/CD', 'Linux', 'Ansible'] },
  { icon: '📱', title: 'Mobile Development', growth: '+38%', color: '#db2777', keyword: 'mobile app developer', skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'] },
  { icon: '🔗', title: 'Blockchain', growth: '+65%', color: '#7c3aed', keyword: 'blockchain developer', skills: ['Solidity', 'Web3.js', 'Smart Contracts'] },
  { icon: '🧠', title: 'Generative AI', growth: '+95%', color: '#9333ea', keyword: 'generative ai engineer', skills: ['LLMs', 'Prompt Engineering', 'LangChain', 'RAG'] },
{ icon: '🤝', title: 'UI/UX Design', growth: '+32%', color: '#ec4899', keyword: 'ui ux designer', skills: ['Figma', 'Prototyping', 'Adobe XD', 'User Research'] },
];

const features = [
  { icon: '📄', title: 'Resume Analyzer', desc: 'Upload your resume and get instant AI-powered feedback, skill gap analysis, and improvement suggestions.', color: '#dbeafe' },
  { icon: '📚', title: 'Course Recommendations', desc: 'Get personalized course suggestions from YouTube, Coursera, Udemy based on your missing skills.', color: '#d1fae5' },
  { icon: '🗺️', title: 'Learning Roadmap', desc: 'AI generates a week-by-week personalized learning plan based on your target role and available hours.', color: '#fef3c7' },
  { icon: '💼', title: 'Live Job Listings', desc: 'Browse real job openings from Adzuna API filtered by your field of interest across India and globally.', color: '#ede9fe' },
  { icon: '🎤', title: 'Mock Interview', desc: 'Practice with AI-generated questions. Get a 2-minute timer, voice recording, and instant feedback per answer.', color: '#fee2e2' },
  { icon: '👥', title: 'Community Q&A', desc: 'Ask questions, share knowledge, vote on answers, and track your leaderboard score with peers.', color: '#e0f2fe' },
];

const formatCount = (num) => {
  if (!num) return 'Loading...';
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L+`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
  return `${num}+`;
};

export default function Landing() {
  const [activeField, setActiveField] = useState(0);
  const [fields, setFields] = useState(fieldConfigs.map(f => ({ ...f, jobs: null, loading: true })));
  const [totalJobs, setTotalJobs] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    // Auto-rotate cards
    const interval = setInterval(() => setActiveField(prev => (prev + 1) % fieldConfigs.length), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch real job counts from backend
    fetchRealJobCounts();
  }, []);

  const fetchRealJobCounts = async () => {
    let total = 0;

    const updated = fields.map(async (field, i) => {
      try {
        const res = await fetch(`/api/trends/jobs?field=${encodeURIComponent(field.title)}&what=${encodeURIComponent(field.keyword)}`);
        const data = await res.json();
        const count = data.totalCount || data.jobs?.length || null;
        total += count || 0;
        return { ...field, jobs: count, loading: false };
      } catch {
        return { ...field, jobs: null, loading: false };
      }
    });

    const resolved = await Promise.all(updated);
    setFields(resolved);
    setTotalJobs(total);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const totalJobsDisplay = totalJobs ? formatCount(totalJobs) : '10K+';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f8fafc', color: '#0f172a', overflowX: 'hidden' }}>

      {/* Navbar */}
      <nav style={{ background: '#0f172a', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.4rem', fontFamily: 'Sora,sans-serif', fontWeight: 700, color: '#f1f5f9' }}>
          🎯 <span>CareerIQ</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/login" style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #334155', color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
            Sign In
          </Link>
          <Link to="/register" style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: '#2563eb', color: 'white', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)', padding: '5rem 2rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.82rem', color: '#60a5fa', marginBottom: '1.5rem' }}>
             AI-Powered Career Intelligence Platform
          </div>
          <h1 style={{ fontSize: '3rem', fontFamily: 'Sora,sans-serif', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, marginBottom: '1.25rem' }}>
            Land Your Dream Tech Job<br />
            <span style={{ color: '#60a5fa' }}>Faster with AI</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 2rem' }}>
            CareerIQ analyzes your resume, identifies skill gaps, recommends courses, generates learning roadmaps, and connects you with live job listings — all in one place.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '0.85rem 2rem', background: '#2563eb', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              🎯 Start For Free
            </Link>
            <Link to="/login" style={{ padding: '0.85rem 2rem', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '10px', textDecoration: 'none', fontWeight: 500, fontSize: '1rem' }}>
              Sign In →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#1e293b', padding: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
          {[
            { value: '10+', label: 'Career Fields Covered' },
            { value: '70%', label: 'Faster Skill Gap Identification' },
            { value: totalJobsDisplay, label: 'Live Jobs Right Now' },
            { value: '100%', label: 'Free to Use' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', fontFamily: 'Sora,sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Fields */}
      <section style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2563eb', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>📈 Live Job Market</div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'Sora,sans-serif', fontWeight: 700, marginBottom: '0.5rem' }}>Trending Career Fields</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Real-time job counts
              {lastUpdated && <span style={{ color: '#10b981', marginLeft: '0.5rem', fontSize: '0.82rem' }}>● Updated {lastUpdated}</span>}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {fields.map((field, i) => (
              <div key={i} onMouseEnter={() => setActiveField(i)}
                style={{ background: 'white', border: `2px solid ${activeField === i ? field.color : '#e2e8f0'}`, borderRadius: '14px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeField === i ? `0 4px 20px ${field.color}22` : '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '2rem' }}>{field.icon}</div>
                  <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px' }}>{field.growth} growth</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{field.title}</div>
                <div style={{ fontSize: '0.82rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {field.loading ? (
                    <span style={{ color: '#94a3b8' }}>⏳ Fetching live count...</span>
                  ) : field.jobs ? (
                    <span style={{ color: '#10b981', fontWeight: 600 }}>🟢 {formatCount(field.jobs)} live jobs</span>
                  ) : (
                    <span style={{ color: '#64748b' }}>💼 Active openings</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {field.skills.map((s, j) => (
                    <span key={j} style={{ background: `${field.color}15`, color: field.color, fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '20px' }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1rem' }}>
              
            </p>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', background: '#2563eb', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
              Find Your Field → Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2563eb', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>⚡ Everything You Need</div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'Sora,sans-serif', fontWeight: 700, marginBottom: '0.5rem' }}>All Career Tools in One Place</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>From resume to job offer — CareerIQ guides you every step of the way</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: f.color, borderRadius: '14px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{f.title}</div>
                <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2563eb', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🔄 Simple Process</div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'Sora,sans-serif', fontWeight: 700, marginBottom: '2.5rem' }}>How CareerIQ Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {[
              { step: '1', icon: '👤', title: 'Create Account', desc: 'Sign up free and set your field of interest' },
              { step: '2', icon: '📄', title: 'Upload Resume', desc: 'Get instant AI analysis and skill gap report' },
              { step: '3', icon: '🗺️', title: 'Follow Roadmap', desc: 'Learn week by week with AI-generated plan' },
              { step: '4', icon: '💼', title: 'Apply for Jobs', desc: 'Browse live listings and ace your interview' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '52px', height: '52px', background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', margin: '0 auto 0.75rem' }}>{s.icon}</div>
                <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700, marginBottom: '0.25rem' }}>STEP {s.step}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{s.title}</div>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f, #0f172a)', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'Sora,sans-serif', fontWeight: 700, color: '#f1f5f9', marginBottom: '1rem' }}>
            Ready to Accelerate Your Career?
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.7 }}>
            Join thousands of students and professionals using CareerIQ to land better jobs faster.
          </p>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', background: '#2563eb', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem' }}>
             Get Started — It's Free
          </Link>
          <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: '#64748b' }}>No credit card required · Free forever</div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', padding: '1.5rem 2rem', textAlign: 'center', color: '#475569', fontSize: '0.82rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontFamily: 'Sora,sans-serif', fontWeight: 700, color: '#f1f5f9', fontSize: '1rem' }}>
          🎯 CareerIQ
        </div>
        AI-Powered Career Intelligence Platform · Built for Students & Professionals
      </footer>

    </div>
  );
}