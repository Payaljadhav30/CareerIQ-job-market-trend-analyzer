import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchPost(); }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/community/${id}`);
      setPost(res.data);
    } catch { setError('Failed to load post'); }
    finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setSubmitting(true); setError('');
    try {
      const res = await axios.post(`/api/community/${id}/answer`, { body: answer });
      setPost(res.data); setAnswer('');
    } catch (err) { setError(err.response?.data?.message || 'Failed to submit answer'); }
    finally { setSubmitting(false); }
  };

  const votePost = async (type) => {
    try { await axios.post(`/api/community/${id}/vote`, { type }); fetchPost(); } catch {}
  };

  const voteAnswer = async (answerId, type) => {
    try { await axios.post(`/api/community/${id}/answer/${answerId}/vote`, { type }); fetchPost(); } catch {}
  };

  const acceptAnswer = async (answerId) => {
    try { await axios.post(`/api/community/${id}/answer/${answerId}/accept`); fetchPost(); } catch {}
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (error && !post) return <div style={{textAlign:'center',padding:'3rem'}}><p style={{color:'#ef4444'}}>{error}</p><Link to="/community" className="btn btn-secondary" style={{marginTop:'1rem'}}>← Back</Link></div>;

  return (
    <div style={{maxWidth:'800px'}}>
      <Link to="/community" style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',color:'#64748b',textDecoration:'none',marginBottom:'1.5rem',fontSize:'0.9rem'}}>← Back to Community</Link>

      {/* Question */}
      <div className="card" style={{marginBottom:'1.5rem',borderTop:'4px solid #2563eb'}}>
        <div style={{display:'flex',gap:'1rem'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.25rem',minWidth:'44px'}}>
            <button onClick={()=>votePost('up')} style={{background:'none',border:'1px solid #e2e8f0',borderRadius:'4px',padding:'0.2rem 0.5rem',cursor:'pointer'}}>▲</button>
            <span style={{fontWeight:700,fontSize:'1rem'}}>{post?.votes}</span>
            <button onClick={()=>votePost('down')} style={{background:'none',border:'1px solid #e2e8f0',borderRadius:'4px',padding:'0.2rem 0.5rem',cursor:'pointer'}}>▼</button>
          </div>
          <div style={{flex:1}}>
            <h1 style={{fontSize:'1.2rem',fontWeight:700,marginBottom:'0.75rem',lineHeight:1.4}}>{post?.title}</h1>
            {post?.body && <p style={{color:'#374151',lineHeight:1.7,marginBottom:'1rem'}}>{post?.body}</p>}
            <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.75rem'}}>
              {post?.tags?.map(t=><span key={t} className="badge badge-primary">{t}</span>)}
            </div>
            <div style={{fontSize:'0.78rem',color:'#94a3b8'}}>
              asked by <strong>{post?.author?.name}</strong> · {new Date(post?.createdAt).toLocaleDateString()} · 👁 {post?.views}
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <h3 style={{marginBottom:'1rem',fontSize:'1rem'}}>{post?.answers?.length || 0} Answer{post?.answers?.length !== 1 ? 's' : ''}</h3>
      {post?.answers?.map(ans => (
        <div key={ans._id} className="card" style={{marginBottom:'0.75rem',borderLeft:`4px solid ${ans.isAccepted?'#10b981':'#e2e8f0'}`}}>
          {ans.isAccepted && (
            <div style={{display:'flex',alignItems:'center',gap:'0.4rem',color:'#065f46',fontWeight:600,fontSize:'0.82rem',marginBottom:'0.5rem'}}>✅ Accepted Answer</div>
          )}
          <div style={{display:'flex',gap:'1rem'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.25rem',minWidth:'44px'}}>
              <button onClick={()=>voteAnswer(ans._id,'up')} style={{background:'none',border:'1px solid #e2e8f0',borderRadius:'4px',padding:'0.15rem 0.4rem',cursor:'pointer',fontSize:'0.8rem'}}>▲</button>
              <span style={{fontWeight:700,fontSize:'0.9rem'}}>{ans.votes}</span>
              <button onClick={()=>voteAnswer(ans._id,'down')} style={{background:'none',border:'1px solid #e2e8f0',borderRadius:'4px',padding:'0.15rem 0.4rem',cursor:'pointer',fontSize:'0.8rem'}}>▼</button>
            </div>
            <div style={{flex:1}}>
              <p style={{color:'#374151',lineHeight:1.7,marginBottom:'0.75rem'}}>{ans.body}</p>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.5rem'}}>
                <div style={{fontSize:'0.78rem',color:'#94a3b8'}}>answered by <strong>{ans.author?.name}</strong> · {new Date(ans.createdAt).toLocaleDateString()}</div>
                {post?.author?._id === user?._id && !ans.isAccepted && (
                  <button onClick={()=>acceptAnswer(ans._id)} className="btn btn-success btn-sm">✓ Accept</button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Answer Form */}
      <div className="card" style={{marginTop:'1.5rem'}}>
        <h3 style={{marginBottom:'1rem',fontSize:'1rem'}}>Your Answer</h3>
        {error && <div style={{background:'#fee2e2',color:'#991b1b',padding:'0.6rem',borderRadius:'6px',marginBottom:'0.75rem',fontSize:'0.88rem'}}>{error}</div>}
        <textarea className="textarea" value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Share your knowledge and help the community..." style={{minHeight:'150px',marginBottom:'1rem'}} />
        <button className="btn btn-primary" onClick={submitAnswer} disabled={submitting||!answer.trim()}>
          {submitting ? 'Submitting...' : 'Post Answer'}
        </button>
      </div>
    </div>
  );
}
