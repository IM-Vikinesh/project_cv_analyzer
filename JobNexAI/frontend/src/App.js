import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import { PageSkeleton } from './components/Skeletons';
import Home from './pages/Home';

const ChatBotButton = lazy(() => import('./components/chatbot/ChatBotButton'));
const ChatWindow = lazy(() => import('./components/chatbot/ChatWindow'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Jobs = lazy(() => import('./pages/Jobs'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Blogs = lazy(() => import('./pages/Blogs'));
const BlogDetails = lazy(() => import('./pages/BlogDetails'));
const CVUpload = lazy(() => import('./pages/CVUpload'));
const CVBuilder = lazy(() => import('./pages/CVBuilder'));
const CVAnalysisResults = lazy(() => import('./pages/CVAnalysisResults'));
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'));
const RecruiterJobs = lazy(() => import('./pages/RecruiterJobs'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Applications = lazy(() => import('./pages/Applications'));
const Profile = lazy(() => import('./pages/Profile'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const AIInterview = lazy(() => import('./pages/AIInterview'));

const AUTH_PATHS = ['/login', '/register', '/forgot-password'];

const getReturnTo = (location) => `${location.pathname}${location.search}${location.hash}`;

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" aria-label="Loading" role="status" />
  </div>
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(getReturnTo(location))}`} replace />;
  }
  return children;
};

const RecruiterRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(getReturnTo(location))}`} replace />;
  }
  if (user.role !== 'recruiter') return <Navigate to="/dashboard" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(getReturnTo(location))}`} replace />;
  }
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const location = useLocation();
  const hideNavbar = AUTH_PATHS.includes(location.pathname);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const openChat = () => setChatOpen(true);
    window.addEventListener('open-chatbot', openChat);
    return () => window.removeEventListener('open-chatbot', openChat);
  }, []);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {user && (
        <Suspense fallback={null}>
          {chatOpen && <ChatWindow onClose={() => setChatOpen(false)} />}
          <ChatBotButton onClick={() => setChatOpen(!chatOpen)} isOpen={chatOpen} />
        </Suspense>
      )}
    </>
  );
};

const Shell = () => {
  const location = useLocation();
  const hideNavbar = AUTH_PATHS.includes(location.pathname);

  return (
    <div className={`relative min-h-screen ${hideNavbar ? '' : 'pt-16 sm:pt-[4.5rem] md:pt-[5.5rem]'}`}>
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
        <ScrollToTop />
        <Shell />
      </Router>
    </AuthProvider>
  );
};

export default App;
