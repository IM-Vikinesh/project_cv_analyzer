import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogsAPI } from '../services/api';
import BlogContent from '../components/BlogContent';
import { getReadingMinutes } from '../components/blogUtils';
import useAsyncData from '../hooks/useAsyncData';
import { BlogArticleSkeleton } from '../components/Skeletons';
import { ErrorState, EmptyState } from '../components/StateMessage';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const BlogDetails = () => {
  const { blogId } = useParams();
  const { data: blog, status, error, retry } = useAsyncData(async (signal) => {
    const response = await blogsAPI.getBlog(blogId, { signal });
    return response.data?.blog || null;
  }, [blogId]);

  if (status === 'loading' || status === 'refreshing') {
    return <BlogArticleSkeleton />;
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <ErrorState
            title="We couldn't load this article"
            message={error || 'The article may have been removed or is temporarily unavailable.'}
            onRetry={retry}
          />
          <div className="text-center mt-6">
            <Link to="/blogs" className="text-primary-600 hover:text-primary-700 font-medium min-h-[44px] inline-flex items-center">
              Back to all articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <EmptyState
            title="Article not found"
            message="This article may have been removed. Explore other career insights instead."
            action={
              <Link to="/blogs" className="btn-primary inline-flex items-center justify-center">
                Back to Articles
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const publishedDate = formatDate(blog.created_at);
  const readingMinutes = getReadingMinutes(blog.content);

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/blogs"
          className="text-primary-600 hover:text-primary-700 inline-flex items-center mb-6 sm:mb-8 font-medium min-h-[44px]"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Articles
        </Link>

        <article className="liquid-glass rounded-3xl overflow-hidden">
          {blog.image_url && (
            <div className="w-full aspect-[16/9] bg-white/20 overflow-hidden">
              <img
                src={blog.image_url}
                alt={blog.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-gray-500 mb-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 font-semibold">
                Article
              </span>
              {publishedDate && <span>{publishedDate}</span>}
              <span className="w-1 h-1 rounded-full bg-gray-300" aria-hidden="true" />
              <span>{readingMinutes} min read</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight text-balance">
              {blog.title}
            </h1>

            <div className="h-px w-full bg-white/40 my-6 sm:my-8" aria-hidden="true" />

            <BlogContent content={blog.content} />
          </div>
        </article>

        <div className="mt-10 flex justify-center">
          <Link to="/blogs" className="btn-outline inline-flex items-center gap-2 min-h-[44px]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
