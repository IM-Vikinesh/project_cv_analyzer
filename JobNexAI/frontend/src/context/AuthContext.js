import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, invalidateApiCache } from '../services/api';

const AuthContext = createContext(null);

const readStoredUser = () => {
  const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!savedUser) return null;
  try {
    return JSON.parse(savedUser);
  } catch (e) {
    return null;
  }
};

const clearStoredSession = () => {
  ['user', 'userId'].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

const persistSession = (mappedUser, remember) => {
  clearStoredSession();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('user', JSON.stringify(mappedUser));
  storage.setItem('userId', mappedUser.id);
};

const mapApiUser = (userData) => ({
  id: userData.id,
  name: userData.full_name,
  email: userData.email,
  role: userData.role,
  phone: userData.phone,
  location: userData.location,
  bio: userData.bio,
  skills: userData.skills,
  experience: userData.experience,
  education: userData.education,
  company_name: userData.company_name,
  position: userData.position,
  company_website: userData.company_website,
  linkedin_url: userData.linkedin_url,
  twitter_url: userData.twitter_url,
  facebook_url: userData.facebook_url,
  profile_image_url: userData.profile_image_url,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const parsed = readStoredUser();
    if (parsed) setUser(parsed);
    setLoading(false);
  }, []);

  const login = async (email, password, remember = true) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });

      if (response.data.success) {
        const mappedUser = mapApiUser(response.data.user);
        persistSession(mappedUser, remember);
        setUser(mappedUser);
        return mappedUser;
      }
      throw new Error(response.data.error || 'Login failed');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    }
  };

  const register = async (name, email, password, role = 'job_seeker', companyName = '') => {
    try {
      setError(null);
      const response = await authAPI.register({ name, email, password, role, company_name: companyName });

      if (response.data.success) {
        const mappedUser = mapApiUser(response.data.user);
        persistSession(mappedUser, true);
        invalidateApiCache('/stats');
        setUser(mappedUser);
        return mappedUser;
      }
      throw new Error(response.data.error || 'Registration failed');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Registration failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    clearStoredSession();
    setUser(null);
  };

  const refreshUser = async () => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) return;

    try {
      const response = await authAPI.getProfile(userId);
      if (response.data.success) {
        const mappedUser = mapApiUser(response.data.user);
        const remember = !!localStorage.getItem('userId');
        persistSession(mappedUser, remember);
        setUser(mappedUser);
      }
    } catch (e) {
      console.error('Error refreshing user:', e);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
