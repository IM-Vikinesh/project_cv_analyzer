import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      console.log('Fetching applications, user role:', user?.role, 'userId:', user?.id);
      
      const response = user?.role === 'recruiter'
        ? await applicationsAPI.getAllRecruiterApplications()
        : await applicationsAPI.getMyApplications({ per_page: 50 });
      
      console.log('Applications response:', response.data);
      
      if (response.data) {
        let apps = response.data.applications || [];
        if (filter !== 'all') {
          apps = apps.filter(app => app.status === filter);
        }
        setApplications(apps);
      }
    } catch (error) {
      console.error('Fetch applications error:', error.response?.data || error.message);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllApplicationsForAdmin = async () => {
    setLoading(true);
    try {
      const response = await applicationsAPI.getAllRecruiterApplications();
      if (response.data) {
        let apps = response.data.applications || [];
        if (filter !== 'all') {
          apps = apps.filter(app => app.status === filter);
        }
        setApplications(apps);
      }
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, status) => {
    try {
      await applicationsAPI.updateApplicationStatus(appId, { status });
      toast.success('Status updated');
      setApplications(prev =>
        prev.map(app => app.id === appId ? { ...app, status } : app)
      );
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    
    try {
      await applicationsAPI.deleteApplication(appId);
      toast.success('Application withdrawn');
      setApplications(prev => prev.filter(app => app.id !== appId));
    } catch (error) {
      toast.error('Failed to withdraw application');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
      interview: 'bg-purple-100 text-purple-800 border-purple-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    interview: applications.filter(a => a.status === 'interview').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'recruiter' ? 'Manage Applications' : 'My Applications'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'recruiter' 
              ? 'Review and manage job applications' 
              : 'Track your job applications'}
          </p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'reviewed', 'interview', 'accepted', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 opacity-75">({statusCounts[status] || 0})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 font-bold text-lg">
                          {(app.job?.company_name || app.job?.company || app.company_name || 'C').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <Link
                          to={`/jobs/${app.job_id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                        >
                          {app.job?.title || app.job_title || 'Job Position'}
                        </Link>
                        <p className="text-gray-600">{app.job?.company_name || app.job?.company || app.company_name || ''}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {app.job?.location || app.job_location || 'Remote'}
                          </span>
                          <span>
                            Applied: {new Date(app.applied_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`badge ${getStatusColor(app.status)} px-4 py-2`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>

                    {user?.role === 'recruiter' ? (
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                        className="input-field py-2 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="interview">Interview</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {app.cover_letter && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Cover Letter</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                      {app.cover_letter.length > 300
                        ? `${app.cover_letter.substring(0, 300)}...`
                        : app.cover_letter}
                    </p>
                  </div>
                )}

                {app.notes && user?.role === 'recruiter' && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{app.notes}</p>
                  </div>
                )}

                {user?.role === 'recruiter' && (app.applicant || app.applicant_name) && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Applicant Info</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                        <span className="text-secondary-600 font-medium">
                          {(app.applicant?.name || app.applicant_name || 'A').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{app.applicant?.name || app.applicant_name}</p>
                        <p className="text-sm text-gray-500">{app.applicant?.email || app.applicant_email}</p>
                      </div>
                      {app.applicant?.skills && (
                        <div className="ml-auto flex flex-wrap gap-1">
                          {app.applicant.skills.split(',').slice(0, 3).map((skill, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-500 mb-4">
              {filter !== 'all' 
                ? 'No applications with this status' 
                : user?.role === 'recruiter'
                ? 'No one has applied to your jobs yet'
                : 'Start applying to jobs to track your applications here'}
            </p>
            {user?.role === 'job_seeker' && (
              <Link to="/jobs" className="btn-primary">
                Browse Jobs
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
