const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

export const getSafeReturnTo = (value, fallback = '') => {
  if (!value || typeof value !== 'string') return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  if (AUTH_ROUTES.some((route) => value === route || value.startsWith(`${route}?`))) return fallback;
  return value;
};

export const getDefaultRouteForRole = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'recruiter') return '/recruiter';
  return '/dashboard';
};
