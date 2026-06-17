import React from 'react';
import Landing from './pages/Landing';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Courses from './pages/Courses';
import Roadmap from './pages/Roadmap';
import Jobs from './pages/Jobs';
import MockInterview from './pages/MockInterview';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/landing" />;
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/resume" element={<ProtectedLayout><ResumeAnalyzer /></ProtectedLayout>} />
      <Route path="/courses" element={<ProtectedLayout><Courses /></ProtectedLayout>} />
      <Route path="/roadmap" element={<ProtectedLayout><Roadmap /></ProtectedLayout>} />
      <Route path="/jobs" element={<ProtectedLayout><Jobs /></ProtectedLayout>} />
      <Route path="/interview" element={<ProtectedLayout><MockInterview /></ProtectedLayout>} />
      <Route path="/community" element={<ProtectedLayout><Community /></ProtectedLayout>} />
      <Route path="/community/:id" element={<ProtectedLayout><PostDetail /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
      <Route path="*" element={user ? <Navigate to="/" /> : <Navigate to="/landing" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router><AppRoutes /></Router>
    </AuthProvider>
  );
}
