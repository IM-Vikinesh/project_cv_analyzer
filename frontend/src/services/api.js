import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      config.headers['X-User-Id'] = userId;
    }
    return config;
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429 && error.response?.data?.limit_exceeded) {
      try {
        const toast = require('react-hot-toast').default;
        toast.error(error.response.data.error || 'Your daily limit is over. Try again after 12 hours.');
      } catch {}
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (data) => api.post('/auth/google', data),
  getProfile: (userId) => api.get(`/auth/profile/${userId}`),
  updateProfile: (userId, data) => api.put(`/auth/profile/${userId}`, data),
};

export const jobsAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (jobId) => api.get(`/jobs/${jobId}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (jobId, data) => api.put(`/jobs/${jobId}`, data),
  deleteJob: (jobId) => api.delete(`/jobs/${jobId}`),
  getRecruiterJobs: (params) => api.get('/jobs/recruiter/jobs', { params }),
};

export const applicationsAPI = {
  createApplication: (data) => api.post('/applications', data),
  getMyApplications: (params) => api.get('/applications/my', { params }),
  getUserApplications: (userId) => api.get(`/applications/user/${userId}`),
  getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),
  getAllRecruiterApplications: (params) => api.get('/applications/recruiter/all', { params }),
  updateApplication: (appId, data) => api.put(`/applications/${appId}`, data),
  updateApplicationStatus: (appId, data) => api.put(`/applications/${appId}/status`, data),
  deleteApplication: (appId) => api.delete(`/applications/${appId}`),
};

export const aiAPI = {
  analyze: (data) => api.post('/ai/analyze', data),
  analyzeCV: (formData) => api.post('/ai/analyze-cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getUserAnalysis: (userId) => api.get(`/ai/user/${userId}`),
  getAnalysis: (analysisId) => api.get(`/ai/${analysisId}`),
  getRecommendations: () => api.get('/ai/recommendations'),
  generateCoverLetter: (data) => api.post('/ai/generate-cover-letter', data),
  saveAnalysisToProfile: (data) => api.post('/ai/save-to-profile', data),
  interview: (data) => api.post('/ai/interview', data),
  recommendFromSkills: (data) => api.post('/ai/recommend-from-skills', data),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export const blogsAPI = {
  getBlogs: (params) => api.get('/blogs', { params }),
  getBlog: (blogId) => api.get(`/blogs/${blogId}`),
};

export const uploadAPI = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getJobs: () => api.get('/admin/jobs'),
  createJob: (data) => api.post('/admin/jobs', data),
  updateJob: (jobId, data) => api.put(`/admin/jobs/${jobId}`, data),
  deleteJob: (jobId) => api.delete(`/admin/jobs/${jobId}`),
  getApplications: () => api.get('/admin/applications'),
  updateApplication: (appId, data) => api.put(`/admin/applications/${appId}`, data),
  getBlogs: () => api.get('/admin/blogs'),
  createBlog: (data) => api.post('/admin/blogs', data),
  updateBlog: (blogId, data) => api.put(`/admin/blogs/${blogId}`, data),
  deleteBlog: (blogId) => api.delete(`/admin/blogs/${blogId}`),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const chatbotAPI = {
  chat: (data) => api.post('/chatbot/chat', data),
  getHistory: (sessionId) => api.get('/chatbot/history', { params: sessionId ? { session_id: sessionId } : {} }),
  getSessions: () => api.get('/chatbot/sessions'),
  analyzeCV: (data) => api.post('/chatbot/cv-analysis', data),
  getCareerRoadmap: (data) => api.post('/chatbot/career-roadmap', data),
  interviewCoach: (data) => api.post('/chatbot/interview-coach', data),
  getJobRecommendations: (data) => api.post('/chatbot/job-recommendations', data),
};

export default api;