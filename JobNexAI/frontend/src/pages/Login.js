import React, { useState, useEffect } from 'react';
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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = getSafeReturnTo(searchParams.get('returnTo'));
  const returnToQuery = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';

  useEffect(() => {
    if (user) {
      navigate(returnTo || getDefaultRouteForRole(user.role), { replace: true });
    }
  }, [user, navigate, returnTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const signedInUser = await login(email, password, remember);
      toast.success('Welcome back!');
      navigate(returnTo || getDefaultRouteForRole(signedInUser?.role), { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white/15 backdrop-blur-md flex items-center justify-center py-8 px-4 relative overflow-hidden">
      <div className="ambient-blob w-96 h-96 bg-accent-cyan/20 top-0 -left-48" />
      <div className="ambient-blob w-96 h-96 bg-primary-400/20 bottom-0 -right-48" />
      <div className="max-w-md w-full relative animate-scale-in">
        <div className="glass-strong border-gray-200 shadow-glass-xl p-8 sm:p-10 rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-500">Sign in to continue your career journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            <InputGroup
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
              label="Email Address"
              name="email"
              autoComplete="email"
              focused={focused}
              setFocused={setFocused}
            />
            <InputGroup
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
              label="Password"
              name="password"
              autoComplete="current-password"
              focused={focused}
              setFocused={setFocused}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 focus-visible:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border rounded-md transition-all duration-200 flex items-center justify-center ${
                    remember ? 'bg-accent-cyan border-accent-cyan' : 'border-white/20 group-hover:border-white/40'
                  }`}>
                    {remember && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
              </label>
              <Link to={`/forgot-password${returnToQuery}`} className="text-sm font-medium text-accent-cyan hover:text-accent-cyan/80">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  Sign In
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to={`/register${returnToQuery}`} className="text-accent-cyan font-semibold hover:text-accent-cyan/80">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
