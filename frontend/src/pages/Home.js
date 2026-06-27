import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, blogsAPI, healthAPI } from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [stats, setStats] = useState({
    jobs: 0,
    companies: 0,
    applications: 0,
  });

  useEffect(() => {
    fetchJobs();
    fetchBlogs();
    checkBackend();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobsAPI.getJobs({ per_page: 6 });
      if (response.data?.jobs) {
        setJobs(response.data.jobs);
        setStats(prev => ({ ...prev, jobs: response.data.total || response.data.jobs.length }));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await blogsAPI.getBlogs({ limit: 3 });
      if (response.data?.blogs) {
        setBlogs(response.data.blogs);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setBlogsLoading(false);
    }
  };

  const checkBackend = async () => {
    try {
      await healthAPI.check();
    } catch (error) {
      console.error('Backend not available:', error);
    }
  };

  const features = [
    {
      title: 'AI Resume Analyzer',
      description: 'Upload your resume and get instant insights powered by advanced NLP technology.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      title: 'ATS Score System',
      description: 'Know exactly how your resume performs with Applicant Tracking Systems.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Smart Job Matching',
      description: 'Our AI matches your skills with the perfect job opportunities.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      title: '24/7 AI Chatbot Assistant',
      description: 'Get instant career guidance, CV tips, and interview prep anytime with our intelligent chatbot.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      title: 'Cover Letter Generator',
      description: 'Create professional cover letters tailored to each job application.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Land Your Dream Job with
              <span className="block text-secondary-300">AI-Powered Insights</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Upload your resume, get AI-powered analysis, optimize for ATS, and discover 
              perfect job matches tailored just for you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <>
                  <Link
                    to={user.role === 'recruiter' ? '/recruiter' : '/dashboard'}
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/jobs"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Browse Jobs
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Powerful AI Features</h2>
            <p className="text-gray-600 mt-4">Everything you need to supercharge your job search</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Latest Opportunities</h2>
            <p className="text-gray-600 mt-4">Discover trending jobs from top companies</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="card p-6 hover:border-primary-500 border border-transparent"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-lg">
                        {job.company?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <span className={`badge ${
                      job.job_type === 'remote' ? 'bg-green-100 text-green-800' :
                      job.job_type === 'full-time' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.job_type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{job.company}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {job.location || 'Remote'}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/jobs" className="btn-primary">
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Latest Articles</h2>
            <p className="text-gray-600 mt-4">Insights and tips for your career growth</p>
          </div>
          
          {blogsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No articles published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blogs/${blog.id}`}
                  className="card p-6 hover:border-primary-500 border border-transparent flex flex-col"
                >
                  {blog.image_url && (
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{blog.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {blog.content?.replace(/<[^>]*>/g, '').substring(0, 120)}...
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/blogs" className="btn-primary">
              View All Articles
            </Link>
          </div>
        </div>
      </section>

      {!user && (
        <section className="py-10 sm:py-16 bg-primary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Transform Your Career?</h2>
            <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who've accelerated their careers with JobNex AI
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      )}

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JN</span>
                </div>
                <span className="text-xl font-bold text-white">JobNex AI</span>
              </div>
              <p className="text-sm">AI-powered job portal helping you land your dream career.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/jobs" className="hover:text-white">Browse Jobs</Link></li>
                <li><Link to="/cv-upload" className="hover:text-white">Resume AI</Link></li>
                <li><Link to="/recommendations" className="hover:text-white">Job Matching</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Recruiters</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-white">Post Jobs</Link></li>
                <li><Link to="/recruiter" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-white cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white cursor-pointer">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 JobNex AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
