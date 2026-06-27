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
  useEffect(() => {
    fetchJobs();
    fetchBlogs();
    checkBackend();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobsAPI.getJobs({ per_page: 6 });
      if (response.data?.jobs) setJobs(response.data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally { setLoading(false); }
  };

  const fetchBlogs = async () => {
    try {
      const response = await blogsAPI.getBlogs({ limit: 3 });
      if (response.data?.blogs) setBlogs(response.data.blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally { setBlogsLoading(false); }
  };

  const checkBackend = async () => {
    try { await healthAPI.check(); }
    catch (error) { console.error('Backend not available:', error); }
  };

  const features = [
    { title: 'AI Resume Analyzer', description: 'Upload your resume and get instant insights powered by advanced NLP technology.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { title: 'ATS Score System', description: 'Know exactly how your resume performs with Applicant Tracking Systems.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { title: 'Smart Job Matching', description: 'Our AI matches your skills with the perfect job opportunities.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { title: 'AI Career Assistant', description: 'Get instant career guidance, CV tips, and interview prep anytime with our intelligent chatbot.', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { title: 'Cover Letter Generator', description: 'Create professional cover letters tailored to each job application.', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { title: 'AI Mock Interviews', description: 'Practice with AI-generated interview questions and get instant feedback.', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '5K+', label: 'Resumes Analyzed' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '1K+', label: 'Companies' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-gray-900 via-primary-900 to-secondary-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary-500/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBtMC0xMGEgMTAgMTAgMCAxIDAgMjAgMCAxMCAxMCAwIDEgMCAwIDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYigyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 mb-8">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-primary-200">AI-Powered Career Platform</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                Land Your
                <span className="block bg-gradient-to-r from-primary-300 via-secondary-300 to-primary-300 bg-clip-text text-transparent">Dream Job</span>
                with AI
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl leading-relaxed">
                Upload your resume, get AI-powered analysis, optimize for ATS, and discover perfect job matches tailored just for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <>
                    <Link to={user.role === 'recruiter' ? '/recruiter' : '/dashboard'} className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5">
                      Go to Dashboard
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5">
                      Get Started Free
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </Link>
                    <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/20 text-white rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
              {!user && (
                <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  <span>Sign up required to access all features</span>
                </div>
              )}
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-primary-500/30 to-secondary-500/30 rounded-full blur-3xl absolute -top-10 -right-10" />
                <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">ATS Score Analysis</p>
                      <p className="text-gray-400 text-sm">Resume optimized at 92%</p>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div className="bg-gradient-to-r from-primary-400 to-secondary-400 h-2 rounded-full" style={{width: '92%'}} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {['Skills', 'Experience', 'Education', 'Format'].map((item) => (
                      <div key={item} className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-white text-sm font-medium">{item}</p>
                        <p className="text-green-400 text-xs mt-1">Excellent</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">AI-powered tools designed to accelerate your career journey from resume optimization to job placement.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary-100">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Opportunities</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">Latest Job Openings</h2>
            </div>
            <Link to="/jobs" className="mt-4 sm:mt-0 inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 group">
              View All Jobs
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="group p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 border border-transparent hover:border-gray-100 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-lg">{job.company?.charAt(0) || 'C'}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.job_type === 'remote' ? 'bg-green-100 text-green-700' : 
                      job.job_type === 'full-time' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>{job.job_type}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{job.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{job.company}</p>
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {job.location || 'Remote'}
                  </div>
                </Link>
              ))}
            </div>
          )}
          {!loading && jobs.length > 0 && (
            <div className="text-center mt-10">
              <Link to="/jobs" className="inline-flex items-center px-8 py-3.5 border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-300">
                Browse All Opportunities
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section for Non-Logged In Users */}
      {!user && (
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-700" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBtMC0xMGEgMTAgMTAgMCAxIDAgMjAgMCAxMCAxMCAwIDEgMCAwIDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYigyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-20" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-primary-100 mb-4 max-w-2xl mx-auto">
              Sign up to unlock AI resume analysis, ATS scoring, job matching, interview coaching, and more.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {['AI Resume Analysis', 'ATS Score Check', 'Smart Job Matching', 'Interview Prep', 'Career Roadmap', '24/7 AI Chatbot'].map((f) => (
                <span key={f} className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/10">
                  {f}
                </span>
              ))}
            </div>
            <Link to="/register" className="inline-flex items-center px-10 py-4 bg-white text-primary-700 rounded-2xl font-bold text-lg hover:bg-primary-50 transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5">
              Create Free Account
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <p className="mt-4 text-primary-200 text-sm">No credit card required. Join 10,000+ users.</p>
          </div>
        </section>
      )}

      {/* Blogs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Articles</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">Career Insights</h2>
            </div>
            <Link to="/blogs" className="mt-4 sm:mt-0 inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 group">
              View All Articles
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          {blogsLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              <p className="text-gray-500 text-lg">No articles published yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <Link key={blog.id} to={`/blogs/${blog.id}`} className="group bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden">
                    {blog.image_url && <img src={blog.image_url} alt={blog.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">{blog.title}</h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-3">{blog.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...</p>
                      <div className="flex items-center text-sm text-gray-400">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link to="/blogs" className="inline-flex items-center px-8 py-3.5 border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-300">
                  Read More Articles
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">JN</span>
                </div>
                <span className="text-xl font-bold text-white">JobNex AI</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">AI-powered job portal helping you land your dream career with smart tools and insights.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/jobs" className="text-gray-400 hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link to="/cv-upload" className="text-gray-400 hover:text-white transition-colors">Resume AI Analysis</Link></li>
                <li><Link to="/ai-interview" className="text-gray-400 hover:text-white transition-colors">AI Interview Prep</Link></li>
                <li><Link to="/recommendations" className="text-gray-400 hover:text-white transition-colors">Job Matching</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Recruiters</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Post Jobs</Link></li>
                <li><Link to="/recruiter" className="text-gray-400 hover:text-white transition-colors">Recruiter Dashboard</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Find Candidates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition-colors">About Us</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Terms of Service</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Contact</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">&copy; 2026 JobNex AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </span>
              <span className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" /></svg>
              </span>
              <span className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
