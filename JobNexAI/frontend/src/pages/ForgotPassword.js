import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getSafeReturnTo } from '../utils/navigation';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const returnTo = getSafeReturnTo(searchParams.get('returnTo'));
  const loginPath = `/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Enter the email address for your account.');
      return;
    }

    setStatus('submitting');
    setError('');

    try {
      const [{ auth }, { sendPasswordResetEmail }] = await Promise.all([
        import('../firebase'),
        import('firebase/auth'),
      ]);
      await sendPasswordResetEmail(auth, trimmedEmail);
      setStatus('sent');
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found') {
        setStatus('sent');
      } else if (code === 'auth/invalid-email') {
        setError('Enter a valid email address.');
        setStatus('idle');
      } else {
        setError('We could not send a reset email right now. Please try again.');
        setStatus('idle');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white/15 backdrop-blur-md flex items-center justify-center py-8 px-4 relative overflow-hidden">
      <div className="ambient-blob w-96 h-96 bg-accent-cyan/20 top-0 -left-48" aria-hidden="true" />
      <div className="ambient-blob w-96 h-96 bg-primary-400/20 bottom-0 -right-48" aria-hidden="true" />
      <div className="max-w-md w-full relative animate-scale-in">
        <div className="glass-strong border-gray-200 shadow-glass-xl p-8 sm:p-10 rounded-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-cyan via-primary-500 to-accent-violet flex items-center justify-center shadow-lg shadow-primary-500/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset your password</h1>
            <p className="text-gray-500">
              Enter your account email and we&apos;ll send a secure reset link if one is available.
            </p>
          </div>

          {status === 'sent' ? (
            <div className="space-y-5" role="status">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-sm text-emerald-800">
                <p className="font-semibold mb-1">Check your inbox</p>
                <p>
                  If <span className="font-medium break-all">{email.trim()}</span> belongs to an account with an
                  email password, a reset link is on its way. The link expires shortly for your security.
                </p>
              </div>
              <p className="text-sm text-gray-500">
                No email within a few minutes? Your account may be managed by your organization.
                Contact your platform administrator.
              </p>
              <Link to={loginPath} className="btn-primary w-full inline-flex items-center justify-center">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/50 text-gray-900 placeholder-gray-400 focus:bg-white/80 focus:border-accent-cyan/50 focus:ring-2 focus:ring-accent-cyan/20 transition-all min-h-[48px]"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'reset-email-error' : undefined}
                  required
                />
                {error && (
                  <p id="reset-email-error" className="mt-2 text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="btn-glow w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Remembered it?{' '}
                <Link to={loginPath} className="text-accent-cyan font-semibold hover:text-accent-cyan/80">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
