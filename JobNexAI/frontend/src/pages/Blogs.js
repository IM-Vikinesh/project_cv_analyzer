import React from 'react';
import { Link } from 'react-router-dom';
import { blogsAPI } from '../services/api';
import { getBlogExcerpt, getReadingMinutes } from '../components/blogUtils';
import useAsyncData from '../hooks/useAsyncData';
import { BlogGridSkeleton } from '../components/Skeletons';
import { ErrorState, EmptyState } from '../components/StateMessage';

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
  const { data: blogs, status, error, retry } = useAsyncData(async (signal) => {
    const response = await blogsAPI.getBlogs({ limit: 50 }, { signal });
    return response.data?.blogs || [];
  }, []);

  const items = blogs || [];

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto">
          <span className="badge bg-primary-50 text-primary-600 mb-4">Career Insights</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900">Blog &amp; Articles</h1>
          <p className="text-gray-600 mt-3">Insights and tips for your career growth</p>
        </div>

        {status === 'loading' ? (
          <BlogGridSkeleton count={6} />
        ) : status === 'error' ? (
          <ErrorState
            title="We couldn't load articles"
            message={error || 'Please check your connection and try again.'}
            onRetry={retry}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="No articles yet"
            message="Career insights and guides will appear here once they are published."
            action={
              <Link to="/jobs" className="btn-outline inline-flex items-center justify-center">
                Browse Jobs
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {items.map((blog) => (
              <Link
                key={blog.id}
                to={`/blogs/${blog.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl liquid-glass hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-accent-cyan/10">
                  {blog.image_url ? (
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      loading="lazy"
                      decoding="async"
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
                      <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
