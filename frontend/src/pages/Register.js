import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const InputGroup = ({ type, value, onChange, icon, label, name, focused, setFocused }) => {
  const isActive = focused === name || value;
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(name)}
        onBlur={() => setFocused(null)}
        className="w-full pl-11 pr-4 pt-5 pb-2 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-primary-500 focus:bg-white transition-all duration-200 placeholder-transparent"
        placeholder={label}
        required
      />
      <label className={`absolute left-11 transition-all duration-200 pointer-events-none ${
        isActive ? 'top-2 text-xs text-primary-500' : 'top-3.5 text-sm text-gray-400'
      }`}>
        {label}
      </label>
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'job_seeker',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      toast.success('Account created successfully!');
      navigate(formData.role === 'recruiter' ? '/recruiter' : '/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await googleLogin();
      toast.success('Account created with Google!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Google sign-up failed');
    } finally { setGoogleLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30 flex items-center justify-center py-8 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwZTk0ZTkiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      <div className="max-w-md w-full relative animate-card-enter">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200 group-hover:shadow-xl group-hover:shadow-primary-300 transition-shadow duration-300">
              <span className="text-white font-bold text-lg">JN</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              JobNex AI
            </span>
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-primary-100/50 border border-white/50 p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
            <p className="text-gray-500">Start your AI-powered job search today</p>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-200 rounded-2xl text-gray-700 font-medium hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 group mb-6"
          >
            {googleLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {googleLoading ? 'Signing up...' : 'Continue with Google'}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-gray-400 font-medium">or sign up with email</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setFormData({ ...formData, role: 'job_seeker' })}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${formData.role === 'job_seeker' ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}
              >
                <div className="text-center">
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center ${formData.role === 'job_seeker' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <span className={`text-sm font-medium ${formData.role === 'job_seeker' ? 'text-primary-600' : 'text-gray-600'}`}>Job Seeker</span>
                </div>
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, role: 'recruiter' })}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${formData.role === 'recruiter' ? 'border-secondary-500 bg-secondary-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}
              >
                <div className="text-center">
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center ${formData.role === 'recruiter' ? 'bg-secondary-100 text-secondary-600' : 'bg-gray-100 text-gray-400'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <span className={`text-sm font-medium ${formData.role === 'recruiter' ? 'text-secondary-600' : 'text-gray-600'}`}>Recruiter</span>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputGroup
              type="text"
              value={formData.name}
              onChange={handleChange}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
              label="Full Name"
              name="name"
              focused={focused}
              setFocused={setFocused}
            />
            <InputGroup
              type="email"
              value={formData.email}
              onChange={handleChange}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
              label="Email Address"
              name="email"
              focused={focused}
              setFocused={setFocused}
            />
            <InputGroup
              type="password"
              value={formData.password}
              onChange={handleChange}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
              label="Password"
              name="password"
              focused={focused}
              setFocused={setFocused}
            />
            <InputGroup
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm4-10V7a4 4 0 00-8 0v4" />}
              label="Confirm Password"
              name="confirmPassword"
              focused={focused}
              setFocused={setFocused}
            />
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary-200 flex items-center justify-center group">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  Create Account
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-500 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
