import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0 });
  const [loading, setLoading] = useState(true);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [activeTab, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await adminAPI.getDashboard();
        setStats(res.data.stats);
      } else if (activeTab === 'users') {
        const res = await adminAPI.getUsers();
        setUsers(res.data.users);
      } else if (activeTab === 'jobs') {
        const res = await adminAPI.getJobs();
        setJobs(res.data.jobs);
      } else if (activeTab === 'applications') {
        const res = await adminAPI.getApplications();
        setApplications(res.data.applications);
      } else if (activeTab === 'blogs') {
        const res = await adminAPI.getBlogs();
        setBlogs(res.data.blogs);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      if (type === 'user') await adminAPI.deleteUser(id);
      else if (type === 'job') await adminAPI.deleteJob(id);
      else if (type === 'blog') await adminAPI.deleteBlog(id);
      toast.success('Deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await adminAPI.uploadFile(file);
      setFormData({ ...formData, image_url: res.data.file_url });
      toast.success('File uploaded');
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  const handleSaveJob = async () => {
    try {
      const data = { ...formData, recruiter_id: user.id, status: 'active' };
      if (editId) {
        await adminAPI.updateJob(editId, data);
      } else {
        await adminAPI.createJob(data);
      }
      toast.success('Job saved');
      setShowJobModal(false);
      setFormData({});
      setEditId(null);
      loadData();
    } catch (err) {
      toast.error('Save failed');
    }
  };

  const handleSaveBlog = async () => {
    try {
      const data = { ...formData, author_id: user.id };
      if (editId) {
        await adminAPI.updateBlog(editId, data);
      } else {
        await adminAPI.createBlog(data);
      }
      toast.success('Blog saved');
      setShowBlogModal(false);
      setFormData({});
      setEditId(null);
      loadData();
    } catch (err) {
      toast.error('Save failed');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUser(userId, { role: newRole });
      toast.success('Role updated');
      loadData();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {user.full_name}</span>
              <button onClick={logout} className="text-red-600 hover:text-red-700">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64 bg-white rounded-lg shadow p-4 h-fit">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-2 rounded mb-1 ${activeTab === 'dashboard' ? 'bg-primary-500 text-white' : 'hover:bg-gray-50'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-4 py-2 rounded mb-1 ${activeTab === 'users' ? 'bg-primary-500 text-white' : 'hover:bg-gray-50'}`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full text-left px-4 py-2 rounded mb-1 ${activeTab === 'jobs' ? 'bg-primary-500 text-white' : 'hover:bg-gray-50'}`}
            >
              Jobs
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full text-left px-4 py-2 rounded mb-1 ${activeTab === 'applications' ? 'bg-primary-500 text-white' : 'hover:bg-gray-50'}`}
            >
              Applications
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`w-full text-left px-4 py-2 rounded mb-1 ${activeTab === 'blogs' ? 'bg-primary-500 text-white' : 'hover:bg-gray-50'}`}
            >
              Blogs
            </button>
          </div>

          <div className="flex-1 bg-white rounded-lg shadow p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Overview</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">{stats.users}</div>
                        <div className="text-gray-600">Total Users</div>
                      </div>
                      <div className="bg-green-50 p-6 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">{stats.jobs}</div>
                        <div className="text-gray-600">Total Jobs</div>
                      </div>
                      <div className="bg-purple-50 p-6 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600">{stats.applications}</div>
                        <div className="text-gray-600">Applications</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Users</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Name</th>
                          <th className="text-left py-2">Email</th>
                          <th className="text-left py-2">Role</th>
                          <th className="text-left py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b">
                            <td className="py-2">{u.full_name}</td>
                            <td className="py-2">{u.email}</td>
                            <td className="py-2">
                              <select
                                value={u.role}
                                onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                className="border rounded px-2 py-1"
                              >
                                <option value="job_seeker">Job Seeker</option>
                                <option value="recruiter">Recruiter</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="py-2">
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleDelete('user', u.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                )}

                {activeTab === 'jobs' && (
                  <div>
                    <div className="flex justify-between mb-6">
                      <h2 className="text-2xl font-bold">Jobs</h2>
                      <button
                        onClick={() => { setShowJobModal(true); setFormData({}); setEditId(null); }}
                        className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
                      >
                        Add Job
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Title</th>
                          <th className="text-left py-2">Company</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-left py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job) => (
                          <tr key={job.id} className="border-b">
                            <td className="py-2">{job.title}</td>
                            <td className="py-2">{job.company_name}</td>
                            <td className="py-2">{job.status}</td>
                            <td className="py-2">
                              <button
                                onClick={() => { setEditId(job.id); setFormData(job); setShowJobModal(true); }}
                                className="text-blue-600 mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete('job', job.id)}
                                className="text-red-600"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                )}

                {activeTab === 'applications' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">All Applications</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left py-3 px-4">Job Title</th>
                            <th className="text-left py-3 px-4">Company</th>
                            <th className="text-left py-3 px-4">Applicant</th>
                            <th className="text-left py-3 px-4">Applicant Email</th>
                            <th className="text-left py-3 px-4">Recruiter</th>
                            <th className="text-left py-3 px-4">Recruiter Email</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Applied Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applications.map((app) => (
                            <tr key={app.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{app.job_title}</td>
                              <td className="py-3 px-4">{app.company_name}</td>
                              <td className="py-3 px-4">{app.applicant_name}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{app.applicant_email}</td>
                              <td className="py-3 px-4">{app.recruiter_name || 'N/A'}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{app.recruiter_email || 'N/A'}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                  app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                  app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  app.status === 'interview' ? 'bg-purple-100 text-purple-800' :
                                  app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {app.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {new Date(app.applied_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {applications.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        No applications found
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'blogs' && (
                  <div>
                    <div className="flex justify-between mb-6">
                      <h2 className="text-2xl font-bold">Blogs</h2>
                      <button
                        onClick={() => { setShowBlogModal(true); setFormData({}); setEditId(null); }}
                        className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
                      >
                        Add Blog
                      </button>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Title</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-left py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogs.map((blog) => (
                          <tr key={blog.id} className="border-b">
                            <td className="py-2">{blog.title}</td>
                            <td className="py-2">{blog.status}</td>
                            <td className="py-2">
                              <button
                                onClick={() => { setEditId(blog.id); setFormData(blog); setShowBlogModal(true); }}
                                className="text-blue-600 mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete('blog', blog.id)}
                                className="text-red-600"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{editId ? 'Edit Job' : 'Add Job'}</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Job Title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Company Name"
                value={formData.company_name || ''}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded px-3 py-2 h-24"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <select
                value={formData.job_type || 'full-time'}
                onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowJobModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJob}
                className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showBlogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{editId ? 'Edit Blog' : 'Add Blog'}</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Blog Title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                placeholder="Content"
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full border rounded px-3 py-2 h-32"
              />
              <div>
                <label className="block text-sm mb-1">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full border rounded px-3 py-2"
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="mt-2 h-24 w-auto" />
                )}
              </div>
              <select
                value={formData.status || 'draft'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowBlogModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBlog}
                className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;