import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogsAPI } from '../services/api';

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
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Blog & Articles</h1>
          <p className="text-gray-600 mt-4">Insights and tips for your career growth</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No articles published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
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
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {blog.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {new Date(blog.created_at).toLocaleDateString()}
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
