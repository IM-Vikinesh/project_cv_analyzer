import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const navScrollRef = useRef(null);
  const [navScroll, setNavScroll] = useState({ left: false, right: false });

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

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/jobs?search=${encodeURIComponent(q)}` : '/jobs');
    setIsOpen(false);
    setShowUserMenu(false);
  };

  const updateNavScroll = useCallback(() => {
    const el = navScrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setNavScroll({
      left: el.scrollLeft > 4,
      right: maxScroll > 4 && el.scrollLeft < maxScroll - 4,
    });
  }, []);

  const scrollNav = (direction) => {
    const el = navScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.6, 180), behavior: 'smooth' });
  };

  useEffect(() => {
    updateNavScroll();
    const onResize = () => updateNavScroll();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateNavScroll, user, location.pathname]);

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

  return (
    <nav className="fixed top-2 left-2 right-2 sm:left-4 sm:right-4 z-50 glass-strong border border-white/20 rounded-3xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 group flex-shrink-0 min-w-[44px] min-h-[44px]" aria-label="JobNex AI home">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-accent-cyan via-primary-500 to-accent-violet rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-sm">JN</span>
            </div>
            <span className="hidden sm:inline text-xl font-bold gradient-text-strong">JobNex AI</span>
          </Link>
          {user && (
            <div className="flex items-center min-w-0 flex-1">
              <div className="hidden lg:flex items-center ml-4 lg:ml-6 min-w-0">
                {navScroll.left && (
                  <button
                    type="button"
                    onClick={() => scrollNav(-1)}
                    aria-label="Scroll navigation left"
                    className="flex-shrink-0 mr-1 p-1.5 rounded-full text-gray-400 hover:text-primary-600 hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}
                <div
                  ref={navScrollRef}
                  onScroll={updateNavScroll}
                  className="flex items-center space-x-1 flex-1 min-w-0 overflow-x-auto scrollbar-hide scroll-smooth"
                >
                  {links.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      aria-current={isActive(link.path) ? 'page' : undefined}
                      className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive(link.path) ? 'text-primary-600 bg-primary-500/5' : 'text-gray-500 hover:text-primary-600 hover:bg-white/30'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                {navScroll.right && (
                  <button
                    type="button"
                    onClick={() => scrollNav(1)}
                    aria-label="Scroll navigation right"
                    className="flex-shrink-0 ml-1 p-1.5 rounded-full text-gray-400 hover:text-primary-600 hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center flex-shrink-0">
            {user && (
              <form onSubmit={handleSearch} className="hidden md:block mr-2 lg:mr-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jobs..."
                    aria-label="Search jobs"
                    className="w-40 lg:w-56 min-h-[44px] pl-9 pr-3 py-2 text-sm rounded-xl bg-white/70 border border-white/40 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-300 transition-all"
                  />
                </div>
              </form>
            )}
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-expanded={showUserMenu}
                  aria-haspopup="menu"
                  aria-label="Open account menu"
                  className="flex items-center space-x-2.5 min-h-[44px] px-2.5 sm:px-3.5 py-2 rounded-xl transition-all duration-200 hover:bg-white/30 active:bg-white/50"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-accent-cyan to-accent-violet text-white">
                    <span className="font-medium text-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div ref={userMenuRef} role="menu" className="absolute right-0 mt-2 w-48 glass-strong rounded-2xl shadow-glass-xl py-2 z-50">
                    <Link
                      to="/profile"
                      role="menuitem"
                      className="flex items-center min-h-[44px] px-4 py-2.5 text-sm text-gray-700 hover:bg-white/30 hover:text-primary-600 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile
                    </Link>
                    {user.role === 'recruiter' && (
                      <Link
                        to="/recruiter"
                        role="menuitem"
                        className="flex items-center min-h-[44px] px-4 py-2.5 text-sm text-gray-700 hover:bg-white/30 hover:text-primary-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Recruiter Dashboard
                      </Link>
                    )}
                    <div className="border-t border-white/20 my-1" role="separator" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center min-h-[44px] text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {!user && (
              <div className="hidden lg:flex items-center gap-2 mr-1">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-white/40 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary inline-flex items-center justify-center min-h-[44px] px-5 py-2 text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}

            <button
              ref={hamburgerRef}
              type="button"
              id="mobile-menu-button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden ml-1 sm:ml-3 w-11 h-11 flex items-center justify-center rounded-xl transition-colors text-gray-500 hover:text-gray-700 hover:bg-white/30 active:bg-white/50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
        <div
          ref={mobileMenuRef}
          id="mobile-navigation"
          className="lg:hidden glass-strong border-t border-white/20 rounded-b-3xl shadow-xl"
        >
          {user && (
            <div className="px-4 pt-3 pb-2 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-cyan to-accent-violet rounded-full flex items-center justify-center text-white">
                  <span className="font-medium text-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role?.replace('_', ' ')}</p>
                </div>
              </div>
              <form onSubmit={handleSearch} className="mt-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jobs..."
                    aria-label="Search jobs"
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 text-sm rounded-xl bg-white/70 border border-white/40 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-300 transition-all"
                  />
                </div>
              </form>
            </div>
          )}
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user && links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={`flex items-center min-h-[44px] px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-primary-600 bg-primary-500/5'
                    : 'text-gray-500 hover:text-primary-600 hover:bg-white/30 active:bg-white/50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <div className="border-t border-white/20 pt-2 mt-2">
                <button
                  type="button"
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full flex items-center min-h-[44px] text-left px-3 py-2.5 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 active:bg-red-100"
                >
                  Sign Out
                </button>
              </div>
            )}
            {!user && (
              <div className="border-t border-white/20 pt-2 mt-2 space-y-2">
                <Link
                  to="/login"
                  className="flex items-center justify-center min-h-[44px] px-3 py-2.5 rounded-xl text-base font-semibold text-gray-700 hover:bg-white/30 active:bg-white/50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary flex items-center justify-center min-h-[44px] px-3 py-2.5 text-base"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
