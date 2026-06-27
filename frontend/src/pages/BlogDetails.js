import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogsAPI } from '../services/api';

const BlogDetails = () => {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      const response = await blogsAPI.getBlog(blogId);
      if (response.data?.blog) {
        setBlog(response.data.blog);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h2>
        <Link to="/blogs" className="text-primary-600 hover:text-primary-700">
          Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blogs" className="text-primary-600 hover:text-primary-700 inline-flex items-center mb-8">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Articles
        </Link>

        <article className="card p-4 sm:p-8">
          {blog.image_url && (
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-48 sm:h-64 object-cover rounded-lg mb-8"
            />
          )}
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
          
          <div className="text-sm text-gray-500 mb-8">
            Published on {new Date(blog.created_at).toLocaleDateString()}
          </div>

          <div
            className="prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>
      </div>
    </div>
  );
};

export default BlogDetails;
