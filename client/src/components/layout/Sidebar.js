import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/resume', icon: '📄', label: 'Resume Analyzer' },
  { path: '/courses', icon: '📚', label: 'Courses' },
  { path: '/roadmap', icon: '🗺️', label: 'Roadmap' },
  { path: '/jobs', icon: '💼', label: 'Jobs & Internships' },
  { path: '/interview', icon: '🎤', label: 'Mock Interview' },
  { path: '/community', icon: '👥', label: 'Community' },
  { path: '/profile', icon: '👤', label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout, darkMode, toggleDarkMode, unreadCount, notifications, markNotificationsRead } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{width:'260px',background:'#0f172a',height:'100vh',position:'fixed',left:0,top:0,display:'flex',flexDirection:'column',padding:'1.5rem 1rem',borderRight:'1px solid #1e293b',zIndex:100,overflowY:'auto'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem',padding:'0 0.5rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
          <span style={{fontSize:'1.8rem'}}>🎯</span>
          <span style={{fontSize:'1.4rem',fontFamily:'Sora,sans-serif',fontWeight:700,color:'#f1f5f9'}}>CareerIQ</span>
        </div>
        <button onClick={toggleDarkMode} title="Toggle dark mode" style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.1rem',color:'#94a3b8'}}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {user?.fieldOfInterest && (
        <div style={{background:'#1e293b',borderRadius:'8px',padding:'0.5rem 0.75rem',marginBottom:'1rem'}}>
          <span style={{fontSize:'0.7rem',color:'#94a3b8',display:'block'}}>Your Field</span>
          <span style={{fontSize:'0.85rem',color:'#60a5fa',fontWeight:600}}>{user.fieldOfInterest}</span>
        </div>
      )}

      <nav style={{flex:1,display:'flex',flexDirection:'column',gap:'0.25rem'}}>
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path==='/'} style={({isActive})=>({display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.7rem 0.75rem',borderRadius:'8px',textDecoration:'none',color:isActive?'#fff':'#94a3b8',background:isActive?'#1e40af':'transparent',fontSize:'0.9rem',fontWeight:500,transition:'all 0.2s'})}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{borderTop:'1px solid #1e293b',paddingTop:'1rem',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
        {/* Notification bell */}
        <div style={{position:'relative'}}>
          <button onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markNotificationsRead(); }}
            style={{width:'100%',background:'#1e293b',border:'none',color:'#94a3b8',padding:'0.5rem 0.75rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem',textAlign:'left',display:'flex',alignItems:'center',gap:'0.5rem'}}>
            🔔 Notifications
            {unreadCount > 0 && <span style={{background:'#ef4444',color:'white',borderRadius:'50%',width:'18px',height:'18px',fontSize:'0.7rem',display:'flex',alignItems:'center',justifyContent:'center',marginLeft:'auto'}}>{unreadCount}</span>}
          </button>
          {showNotifs && (
            <div style={{position:'absolute',bottom:'100%',left:0,right:0,background:'#1e293b',border:'1px solid #334155',borderRadius:'8px',maxHeight:'200px',overflowY:'auto',marginBottom:'0.5rem',zIndex:200}}>
              {notifications.length === 0 ? (
                <div style={{padding:'1rem',color:'#94a3b8',fontSize:'0.82rem',textAlign:'center'}}>No notifications</div>
              ) : notifications.slice(0,8).map((n, i) => (
                <div key={i} onClick={() => { n.postId && navigate(`/community/${n.postId}`); setShowNotifs(false); }}
                  style={{padding:'0.65rem 0.75rem',borderBottom:'1px solid #334155',cursor:'pointer',background:n.read?'transparent':'#1e3a5f',fontSize:'0.82rem',color:'#e2e8f0'}}>
                  {n.message}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
          <div style={{width:'36px',height:'36px',background:'#2563eb',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:'0.9rem',flexShrink:0}}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{overflow:'hidden'}}>
            <div style={{fontSize:'0.9rem',fontWeight:600,color:'#f1f5f9',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.name}</div>
            <div style={{fontSize:'0.72rem',color:'#94a3b8',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{background:'#1e293b',border:'none',color:'#94a3b8',padding:'0.5rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem',textAlign:'left'}}>🚪 Logout</button>
      </div>
    </aside>
  );
}
