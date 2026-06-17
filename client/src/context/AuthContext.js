import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
      fetchNotifications();
    } catch { logout(); } finally { setLoading(false); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/community/notifications/all');
      setNotifications(res.data);
    } catch {}
  };

  const markNotificationsRead = async () => {
    try {
      await axios.put('/api/community/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken); setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/api/auth/register', { name, email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken); setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null); setUser(null); setNotifications([]);
  };

  const updateField = async (fieldOfInterest) => {
    const res = await axios.put('/api/auth/field', { fieldOfInterest });
    setUser(res.data); return res.data;
  };

  const updateProfile = async (data) => {
    const res = await axios.put('/api/auth/profile', data);
    setUser(res.data); return res.data;
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider value={{
      user, token, loading, darkMode, notifications, unreadCount,
      login, register, logout, updateField, updateProfile,
      fetchUser, toggleDarkMode, fetchNotifications, markNotificationsRead
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
