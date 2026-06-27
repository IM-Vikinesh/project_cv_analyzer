import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === '/';
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowUserMenu(false);
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && !hamburgerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, showUserMenu]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const adminLinks = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/profile', label: 'Profile' },
  ];

  const recruiterLinks = [
    { path: '/recruiter', label: 'Dashboard' },
    { path: '/recruiter/jobs', label: 'My Jobs' },
    { path: '/applications', label: 'Applications' },
  ];

  const jobSeekerLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/jobs', label: 'Find Jobs' },
    { path: '/applications', label: 'Applications' },
    { path: '/recommendations', label: 'For You' },
    { path: '/cv-upload', label: 'Resume AI' },
    { path: '/cv-builder', label: 'CV Builder' },
    { path: '/ai-interview', label: 'AI Interview' },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'recruiter' ? recruiterLinks : jobSeekerLinks;

  const navBg = isHome && !scrolled
    ? 'bg-transparent'
    : 'bg-white/80 backdrop-blur-xl shadow-sm';

  const linkColor = isHome && !scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-primary-600';
  const activeLinkColor = isHome && !scrolled ? 'text-white bg-white/10' : 'text-primary-600 bg-primary-50';
  const logoGradient = isHome && !scrolled ? 'from-white to-white' : 'from-primary-600 to-secondary-600';
  const borderColor = isHome && !scrolled ? 'border-white/10' : 'border-gray-100';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className={`w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105`}>
                <span className="text-white font-bold text-sm">JN</span>
              </div>
              <span className={`text-xl font-bold bg-gradient-to-r ${logoGradient} bg-clip-text text-transparent`}>
                JobNex AI
              </span>
            </Link>

            {user && (
              <div className="hidden lg:flex ml-10 space-x-1">
                {links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.path) ? activeLinkColor : linkColor
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-xl transition-all duration-200 ${
                    isHome && !scrolled ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isHome && !scrolled ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600'
                  }`}>
                    <span className="font-medium text-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className={`hidden md:block text-sm font-medium ${isHome && !scrolled ? 'text-white' : 'text-gray-700'}`}>
                    {user.name}
                  </span>
                  <svg className={`w-4 h-4 ${isHome && !scrolled ? 'text-white/60' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div ref={userMenuRef} className={`absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-50 border ${borderColor}`}>
                    <Link
                      to="/profile"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile
                    </Link>
                    {user.role === 'recruiter' && (
                      <Link
                        to="/recruiter"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Recruiter Dashboard
                      </Link>
                    )}
                    <div className={`border-t ${borderColor} my-1`} />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isHome && !scrolled
                      ? 'text-gray-200 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isHome && !scrolled
                      ? 'bg-white text-primary-700 hover:bg-gray-100 shadow-lg'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-200'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            )}

            <button
              ref={hamburgerRef}
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden ml-3 p-2.5 rounded-xl transition-colors ${
                isHome && !scrolled ? 'text-white hover:bg-white/10' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div ref={mobileMenuRef} className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl">
          {user && (
            <div className="px-4 pt-3 pb-2 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          )}
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            )) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2.5 rounded-xl text-base font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 mx-2"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
            {user && (
              <div className="border-t border-gray-100 pt-2 mt-2">
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
