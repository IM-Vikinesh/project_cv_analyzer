import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const AuthContext = createContext(null);

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
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      
if (response.data.success) {
        const userData = response.data.user;
        const mappedUser = {
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
        };
        localStorage.setItem('user', JSON.stringify(mappedUser));
        localStorage.setItem('userId', userData.id);
        setUser(mappedUser);
        if (userData.role === 'admin') {
          window.location.href = '/admin';
        }
        return mappedUser;
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    }
  };

  const register = async (name, email, password, role = 'job_seeker') => {
    try {
      setError(null);
      const response = await authAPI.register({ name, email, password, role });
      
      if (response.data.success) {
        const userData = response.data.user;
        const mappedUser = {
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
        };
        localStorage.setItem('user', JSON.stringify(mappedUser));
        localStorage.setItem('userId', userData.id);
        setUser(mappedUser);
        if (userData.role === 'admin') {
          window.location.href = '/admin';
        }
        return mappedUser;
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Register error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Registration failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const googleLogin = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await authAPI.googleAuth({ id_token: idToken });

      if (response.data.success) {
        const userData = response.data.user;
        const mappedUser = {
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
        };
        localStorage.setItem('user', JSON.stringify(mappedUser));
        localStorage.setItem('userId', userData.id);
        setUser(mappedUser);
        if (userData.role === 'admin') {
          window.location.href = '/admin';
        }
        return mappedUser;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Google sign-in failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch {}
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const refreshUser = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        const response = await authAPI.getProfile(userId);
        if (response.data.success) {
          const userData = response.data.user;
          const mappedUser = {
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
          };
          localStorage.setItem('user', JSON.stringify(mappedUser));
          setUser(mappedUser);
        }
      } catch (e) {
        console.error('Error refreshing user:', e);
      }
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    googleLogin,
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