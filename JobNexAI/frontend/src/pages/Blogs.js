import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogsAPI } from '../services/api';
import { getBlogExcerpt, getReadingMinutes } from '../components/BlogContent';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await blogsAPI.getBlogs({ limit: 50 });
      if (response.data?.blogs) {
        setBlogs(response.data.blogs);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto">
          <span className="badge bg-primary-50 text-primary-600 mb-4">Career Insights</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900">Blog &amp; Articles</h1>
          <p className="text-gray-600 mt-3">Insights and tips for your career growth</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-gray-500">No articles published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                to={`/blogs/${blog.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl liquid-glass hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-accent-cyan/10">
                  {blog.image_url ? (
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl font-extrabold gradient-text-strong">
                        {blog.title?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-semibold">
                      Article
                    </span>
                    {formatDate(blog.created_at) && <span>{formatDate(blog.created_at)}</span>}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {blog.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
                    {getBlogExcerpt(blog.content, 160)}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>{getReadingMinutes(blog.content)} min read</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary-600">
                      Read more
                      <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
