import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, applicationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState({
    savedJobs: 0,
    applications: 0,
    profileViews: 0,
    matchScore: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes, recRes] = await Promise.all([
        jobsAPI.getJobs({ per_page: 5 }),
        applicationsAPI.getMyApplications({ per_page: 5 }),
        getRecommendations()
      ]);

      if (jobsRes.data) {
        setRecentJobs(jobsRes.data.jobs || []);
      }

      if (appsRes.data) {
        setRecentApplications(appsRes.data.applications || []);
        setStats(prev => ({ ...prev, applications: appsRes.data.total || 0 }));
      }

      if (recRes?.data) {
        setRecommendations(recRes.data.recommendations?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    try {
      return await jobsAPI.getJobs({ per_page: 3 });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return null;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      interview: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Job Seeker'}!
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your job search</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.applications}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saved Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.savedJobs}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profile Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.skills ? '85%' : '50%'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Job Matches</p>
                <p className="text-2xl font-bold text-gray-900">{recommendations.length}+</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                <Link to="/applications" className="text-primary-600 text-sm hover:text-primary-500">
                  View All
                </Link>
              </div>
              <div className="divide-y">
                {recentApplications.length > 0 ? (
                  recentApplications.map((app) => (
                    <div key={app.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {app.job?.title || 'Job Position'}
                          </h3>
                          <p className="text-sm text-gray-500">{app.job?.company}</p>
                        </div>
                        <span className={`badge ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 mb-4">No applications yet</p>
                    <Link to="/jobs" className="btn-primary">
                      Find Jobs
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recommended For You</h2>
                <Link to="/recommendations" className="text-primary-600 text-sm hover:text-primary-500">
                  View All
                </Link>
              </div>
              <div className="divide-y">
                {recommendations.length > 0 ? (
                  recommendations.map((rec) => (
                    <div key={rec.job?.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{rec.job?.title}</h3>
                          <p className="text-sm text-gray-500">{rec.job?.company}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                              {rec.match_score}% match
                            </span>
                            {rec.matched_skills?.slice(0, 2).map((skill, i) => (
                              <span key={i} className="text-xs text-gray-500">{skill}</span>
                            ))}
                          </div>
                        </div>
                        <Link
                          to={`/jobs/${rec.job?.id}`}
                          className="btn-outline text-sm"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 mb-4">Update your skills to get personalized recommendations</p>
                    <Link to="/cv-upload" className="btn-primary">
                      Upload Resume
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/cv-upload"
                  className="flex items-center gap-3 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm">Analyze Resume</span>
                </Link>
                <Link
                  to="/cv-builder"
                  className="flex items-center gap-3 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm">Build CV</span>
                </Link>
                <Link
                  to="/jobs"
                  className="flex items-center gap-3 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm">Search Jobs</span>
                </Link>
                <Link
                  to="/ai-interview"
                  className="flex items-center gap-3 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm">AI Interview</span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Skills</h3>
              {user?.skills ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.split(',').map((skill, i) => (
                    <span key={i} className="badge bg-primary-100 text-primary-700">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-3">No skills added yet</p>
                  <Link to="/profile" className="text-primary-600 text-sm hover:text-primary-500">
                    Add Skills
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div className="text-right w-full">
                    <span className="text-xs font-semibold inline-block text-primary-600">
                      {user?.skills ? 85 : 40}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${user?.skills ? 85 : 40}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                  ></div>
                </div>
                <Link to="/profile" className="text-primary-600 text-sm hover:text-primary-500">
                  Complete your profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
