import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { getDefaultRouteForRole, getSafeReturnTo } from '../utils/navigation';

const InputGroup = ({ type, value, onChange, icon, label, name, focused, setFocused, rightElement, autoComplete }) => {
  const isActive = focused === name || value;
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-accent-cyan' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
        autoComplete={autoComplete}
        className="w-full pl-11 pr-11 pt-5 pb-2 bg-white/25 border border-white/40 text-gray-900 placeholder-gray-500 focus:bg-white/40 focus:border-accent-cyan/40 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 placeholder-transparent"
        placeholder={label}
        required
      />
      <label className={`absolute left-11 transition-all duration-200 pointer-events-none ${
        isActive ? 'top-2 text-xs text-accent-cyan' : 'top-3.5 text-sm text-gray-400'
      }`}>
        {label}
      </label>
      {rightElement && (
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'job_seeker', companyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = getSafeReturnTo(searchParams.get('returnTo'));
  const returnToQuery = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';

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
    const companyName = formData.role === 'recruiter' ? formData.companyName.trim() : '';
    if (formData.role === 'recruiter' && !companyName) {
      toast.error('Company name is required for recruiters'); return;
    }
    setLoading(true);
    try {
      const signedUpUser = await register(formData.name, formData.email, formData.password, formData.role, companyName);
      toast.success('Account created successfully!');
      navigate(returnTo || getDefaultRouteForRole(signedUpUser?.role || formData.role), { replace: true });
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white/15 backdrop-blur-md flex items-center justify-center py-8 px-4 relative overflow-hidden">
      <div className="ambient-blob w-96 h-96 bg-accent-cyan/20 top-0 -left-48" />
      <div className="ambient-blob w-96 h-96 bg-primary-400/20 bottom-0 -right-48" />
      <div className="max-w-md w-full relative animate-scale-in">
        <div className="glass-strong border-gray-200 shadow-glass-xl p-8 sm:p-10 rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-500">Start your AI-powered job search today</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setFormData({ ...formData, role: 'job_seeker' })}
                aria-pressed={formData.role === 'job_seeker'}
                className={`p-4 rounded-2xl transition-all duration-200 ${formData.role === 'job_seeker' ? 'bento-card-glass border-accent-cyan/50' : 'bg-white/20 border border-white/40'}`}
              >
                <div className="text-center">
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center ${formData.role === 'job_seeker' ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-white/30 text-gray-500'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <span className={`text-sm font-medium ${formData.role === 'job_seeker' ? 'text-accent-cyan' : 'text-gray-500'}`}>Job Seeker</span>
                </div>
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, role: 'recruiter' })}
                aria-pressed={formData.role === 'recruiter'}
                className={`p-4 rounded-2xl transition-all duration-200 ${formData.role === 'recruiter' ? 'bento-card-glass border-accent-cyan/50' : 'bg-white/20 border border-white/40'}`}
              >
                <div className="text-center">
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center ${formData.role === 'recruiter' ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-white/30 text-gray-500'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <span className={`text-sm font-medium ${formData.role === 'recruiter' ? 'text-accent-cyan' : 'text-gray-500'}`}>Recruiter</span>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            <InputGroup
              type="text"
              value={formData.name}
              onChange={handleChange}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
              label="Full Name"
              name="name"
              autoComplete="name"
              focused={focused}
              setFocused={setFocused}
            />
            {formData.role === 'recruiter' && (
              <InputGroup
                type="text"
                value={formData.companyName}
                onChange={handleChange}
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
                label="Company Name"
                name="companyName"
                autoComplete="organization"
                focused={focused}
                setFocused={setFocused}
              />
            )}
            <InputGroup
              type="email"
              value={formData.email}
              onChange={handleChange}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
              label="Email Address"
              name="email"
              autoComplete="email"
              focused={focused}
              setFocused={setFocused}
            />
            <InputGroup
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
              label="Password"
              name="password"
              autoComplete="new-password"
              focused={focused}
              setFocused={setFocused}
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="w-11 h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 focus-visible:text-gray-700" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              }
            />
            <InputGroup
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm4-10V7a4 4 0 00-8 0v4" />}
              label="Confirm Password"
              name="confirmPassword"
              autoComplete="new-password"
              focused={focused}
              setFocused={setFocused}
              rightElement={
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="w-11 h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 focus-visible:text-gray-700" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} aria-pressed={showConfirmPassword}>
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              }
            />
            <button type="submit" disabled={loading} className="btn-glow w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group">
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
            <Link to={`/login${returnToQuery}`} className="text-accent-cyan font-semibold hover:text-accent-cyan/80">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
