import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import ChatBotButton from './components/chatbot/ChatBotButton';
import ChatWindow from './components/chatbot/ChatWindow';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Dashboard from './pages/Dashboard';
import Blogs from './pages/Blogs';
import BlogDetails from './pages/BlogDetails';
import CVUpload from './pages/CVUpload';
import CVBuilder from './pages/CVBuilder';
import CVAnalysisResults from './pages/CVAnalysisResults';
import RecruiterDashboard from './pages/RecruiterDashboard';
import RecruiterJobs from './pages/RecruiterJobs';
import AdminDashboard from './pages/AdminDashboard';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import AIInterview from './pages/AIInterview';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const RecruiterRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'recruiter') return <Navigate to="/dashboard" />;
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const openChat = () => setChatOpen(true);
    window.addEventListener('open-chatbot', openChat);
    return () => window.removeEventListener('open-chatbot', openChat);
  }, []);
  
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blogs/:blogId" element={<BlogDetails />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            {user?.role === 'recruiter' ? <RecruiterDashboard /> : <Dashboard />}
          </PrivateRoute>
        } />
        
        <Route path="/cv-upload" element={
          <PrivateRoute>
            <CVUpload />
          </PrivateRoute>
        } />
        
        <Route path="/cv-analysis" element={
          <PrivateRoute>
            <CVAnalysisResults />
          </PrivateRoute>
        } />
        
        <Route path="/cv-builder" element={
          <PrivateRoute>
            <CVBuilder />
          </PrivateRoute>
        } />
        
        <Route path="/recruiter" element={
          <RecruiterRoute>
            <RecruiterDashboard />
          </RecruiterRoute>
        } />

        <Route path="/recruiter/jobs" element={
          <RecruiterRoute>
            <RecruiterJobs />
          </RecruiterRoute>
        } />
        
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        <Route path="/applications" element={
          <PrivateRoute>
            <Applications />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        
        <Route path="/ai-interview" element={
          <PrivateRoute>
            <AIInterview />
          </PrivateRoute>
        } />
        
        <Route path="/recommendations" element={
          <PrivateRoute>
            <Recommendations />
          </PrivateRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {user && (
        <>
          {chatOpen && <ChatWindow onClose={() => setChatOpen(false)} />}
          <ChatBotButton onClick={() => setChatOpen(!chatOpen)} isOpen={chatOpen} />
        </>
      )}
    </>
  );
};

const Shell = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';

  return (
    <div className={`relative min-h-screen ${hideNavbar ? '' : 'pt-16 sm:pt-[4.5rem] md:pt-[5.5rem]'}`}>
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none bg-white/10 backdrop-blur-2xl" />
      <div className="relative z-10">
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#059669',
              },
            },
            error: {
              style: {
                background: '#dc2626',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Shell />
      </Router>
    </AuthProvider>
  );
};

export default App;
