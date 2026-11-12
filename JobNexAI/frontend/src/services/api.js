import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getStoredUserId = () =>
  localStorage.getItem('userId') || sessionStorage.getItem('userId');

api.interceptors.request.use(
  (config) => {
    const userId = getStoredUserId();
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

const responseCache = new Map();
const inFlightGets = new Map();
const DEFAULT_CACHE_TTL = 60 * 1000;

const buildCacheKey = (url, params) => {
  const userId = getStoredUserId() || 'anonymous';
  return `${url}|${JSON.stringify(params || {})}|${userId}`;
};

const createAbortError = () => {
  const error = new Error('Request canceled');
  error.name = 'AbortError';
  error.code = 'ERR_CANCELED';
  return error;
};

const attachAbort = (promise, signal) => {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(createAbortError());

  return new Promise((resolve, reject) => {
    const cleanup = () => signal.removeEventListener('abort', onAbort);
    const onAbort = () => {
      cleanup();
      reject(createAbortError());
    };

    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error) => {
        cleanup();
        reject(error);
      }
    );
  });
};

const cachedGet = (url, config = {}, ttl = DEFAULT_CACHE_TTL) => {
  const { params, signal, ...rest } = config;
  const key = buildCacheKey(url, params);
  const now = Date.now();
  const cached = responseCache.get(key);

  if (cached && now - cached.timestamp < ttl) {
    return Promise.resolve(cached.response);
  }

  if (inFlightGets.has(key)) {
    return attachAbort(inFlightGets.get(key), signal);
  }

  const request = api
    .get(url, { ...rest, params })
    .then((response) => {
      responseCache.set(key, { timestamp: Date.now(), response });
      return response;
    })
    .finally(() => {
      inFlightGets.delete(key);
    });

  inFlightGets.set(key, request);
  return attachAbort(request, signal);
};

export const invalidateApiCache = (urlPrefix) => {
  for (const key of responseCache.keys()) {
    if (!urlPrefix || key.startsWith(urlPrefix)) responseCache.delete(key);
  }
};

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: (userId) => api.get(`/auth/profile/${userId}`),
  updateProfile: (userId, data) => api.put(`/auth/profile/${userId}`, data),
  changePassword: (userId, data) => api.post(`/auth/change-password/${userId}`, data),
  deleteAccount: (userId) => api.delete(`/auth/profile/${userId}`),
};

export const jobsAPI = {
  getJobs: (params, config = {}) => cachedGet('/jobs', { ...config, params }, 45 * 1000),
  getJob: (jobId, config = {}) => api.get(`/jobs/${jobId}`, config),
  createJob: (data) => api.post('/jobs', data).then((res) => {
    invalidateApiCache('/jobs');
    return res;
  }),
  updateJob: (jobId, data) => api.put(`/jobs/${jobId}`, data).then((res) => {
    invalidateApiCache('/jobs');
    return res;
  }),
  deleteJob: (jobId) => api.delete(`/jobs/${jobId}`).then((res) => {
    invalidateApiCache('/jobs');
    return res;
  }),
  getRecruiterJobs: (params, config = {}) => api.get('/jobs/recruiter/jobs', { ...config, params }),
  saveJob: (jobId) => api.post(`/jobs/${jobId}/save`).then((res) => {
    invalidateApiCache('/jobs');
    return res;
  }),
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
  getBlogs: (params, config = {}) => cachedGet('/blogs', { ...config, params }, 2 * 60 * 1000),
  getBlog: (blogId, config = {}) => cachedGet(`/blogs/${blogId}`, config, 2 * 60 * 1000),
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

export const statsAPI = {
  getStats: (config = {}) => api.get('/stats', config),
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