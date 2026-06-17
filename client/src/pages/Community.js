import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', tags: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [leaderboard, setLeaderboard] = useState([]);

  const popularTags = ['React', 'Node.js', 'Python', 'DSA', 'Resume', 'Placement', 'AI/ML', 'Java', 'JavaScript', 'System Design'];

  useEffect(() => { fetchPosts(1); }, [selectedTag]);

  const fetchPosts = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 10 });
      if (selectedTag) params.append('tag', selectedTag);
      if (search) params.append('search', search);
      const res = await axios.get(`/api/community?${params}`);
      setPosts(res.data.posts);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setPage(p);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchLeaderboard = async () => {
    try { const res = await axios.get('/api/community/leaderboard'); setLeaderboard(res.data); } catch {}
  };

  const handlePost = async () => {
    if (!form.title.trim()) { setFormError('Title is required'); return; }
    setFormError(''); setFormLoading(true);
    try {
      const tagsArr = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      await axios.post('/api/community', { title: form.title, body: form.body, tags: tagsArr });
      setShowForm(false);
      setForm({ title: '', body: '', tags: '' });
      fetchPosts(1);
    } catch (err) { setFormError(err.response?.data?.message || 'Failed to post'); }
    finally { setFormLoading(false); }
  };

  const handleVote = async (postId, type) => {
    try { await axios.post(`/api/community/${postId}/vote`, { type }); fetchPosts(page); } catch {}
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>👥 Community</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Ask questions · Share knowledge · Help others</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setFormError(''); }}>
          {showForm ? '✕ Cancel' : '+ Ask Question'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button onClick={() => setActiveTab('posts')} className="btn btn-sm" style={{ background: activeTab === 'posts' ? '#2563eb' : 'white', color: activeTab === 'posts' ? 'white' : '#374151', border: '1px solid #e2e8f0' }}>
          💬 Questions
        </button>
        <button onClick={() => { setActiveTab('leaderboard'); fetchLeaderboard(); }} className="btn btn-sm" style={{ background: activeTab === 'leaderboard' ? '#2563eb' : 'white', color: activeTab === 'leaderboard' ? 'white' : '#374151', border: '1px solid #e2e8f0' }}>
          🏆 Leaderboard
        </button>
      </div>

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>🏆 Top Contributors</h3>
          {leaderboard.length === 0
            ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No data yet — start contributing!</p>
            : leaderboard.map((u, i) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '30px', height: '30px', background: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#d97706' : '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: i < 3 ? 'white' : '#374151' }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.posts} posts · {u.answers} answers · {u.votes} votes</div>
                </div>
                <div style={{ fontWeight: 700, color: '#2563eb' }}>{u.score} pts</div>
              </div>
            ))}
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <>
          {/* Ask Form */}
          {showForm && (
            <div className="card" style={{ marginBottom: '1.25rem', border: '2px solid #2563eb' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Ask a Question</h3>
              {formError && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.6rem', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{formError}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title — what's your question? *" />
                <textarea className="textarea" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="More details... (optional)" style={{ minHeight: '80px' }} />
                <input className="input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags — e.g. React, Python (optional)" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {popularTags.map(t => (
                    <span key={t} onClick={() => setForm({ ...form, tags: form.tags ? `${form.tags}, ${t}` : t })}
                      className="badge badge-primary" style={{ cursor: 'pointer' }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-primary" onClick={handlePost} disabled={formLoading || !form.title.trim()}>{formLoading ? 'Posting...' : 'Post Question'}</button>
                  <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Search + Tag filter */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input className="input" style={{ flex: 1, minWidth: '200px' }} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchPosts(1)} placeholder="🔍 Search questions..." />
            <button className="btn btn-secondary" onClick={() => fetchPosts(1)}>Search</button>
            {selectedTag && <button className="btn btn-sm btn-secondary" onClick={() => setSelectedTag('')}>✕ {selectedTag}</button>}
          </div>

          {/* Tag chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
            {popularTags.map(t => (
              <span key={t} onClick={() => setSelectedTag(selectedTag === t ? '' : t)}
                className="badge badge-primary"
                style={{ cursor: 'pointer', background: selectedTag === t ? '#1d4ed8' : '#dbeafe', color: selectedTag === t ? 'white' : '#1d4ed8' }}>{t}</span>
            ))}
          </div>

          <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.75rem' }}>{total} question{total !== 1 ? 's' : ''}</div>

          {/* Posts list */}
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem' }}>❓</div>
              <p style={{ fontWeight: 600, color: '#64748b', marginTop: '1rem' }}>No questions yet. Be the first to ask!</p>
            </div>
          ) : posts.map(post => (
            <div key={post._id} className="card" style={{ marginBottom: '0.65rem', display: 'flex', gap: '0.75rem', padding: '1rem' }}>
              {/* Vote + answer count */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', minWidth: '40px' }}>
                <button onClick={() => handleVote(post._id, 'up')} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.15rem 0.4rem', cursor: 'pointer', fontSize: '0.75rem' }}>▲</button>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{post.votes}</span>
                <button onClick={() => handleVote(post._id, 'down')} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.15rem 0.4rem', cursor: 'pointer', fontSize: '0.75rem' }}>▼</button>
                <div style={{ textAlign: 'center', marginTop: '0.25rem', background: post.answers?.some(a => a.isAccepted) ? '#d1fae5' : '#f1f5f9', borderRadius: '6px', padding: '0.25rem 0.3rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: post.answers?.some(a => a.isAccepted) ? '#065f46' : '#374151' }}>{post.answers?.length || 0}</div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>ans</div>
                </div>
              </div>

              {/* Post content */}
              <div style={{ flex: 1 }}>
                <Link to={`/community/${post._id}`} style={{ textDecoration: 'none', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.4, display: 'block', marginBottom: '0.3rem' }}>
                  {post.title}
                </Link>
                {post.body && <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.4rem' }}>{post.body.substring(0, 100)}{post.body.length > 100 ? '...' : ''}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {post.tags?.map(t => <span key={t} className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => setSelectedTag(t)}>{t}</span>)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    by <strong>{post.author?.name}</strong> · {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Answer button */}
              <Link to={`/community/${post._id}`} className="btn btn-primary btn-sm" style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}>
                Answer →
              </Link>
            </div>
          ))}

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => fetchPosts(page - 1)} disabled={page <= 1}>← Prev</button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => fetchPosts(p)} className="btn btn-sm" style={{ background: p === page ? '#2563eb' : 'white', color: p === page ? 'white' : '#374151', border: '1px solid #e2e8f0', minWidth: '34px' }}>{p}</button>
              ))}
              <button className="btn btn-secondary btn-sm" onClick={() => fetchPosts(page + 1)} disabled={page >= pages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}