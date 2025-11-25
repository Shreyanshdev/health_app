'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import type { Blog } from '@/types';

export function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      // Use public endpoint for non-authenticated users
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const endpoint = token ? '/blogs' : '/blogs/public';
      const response = await api.get(endpoint);
      setBlogs(response.data);
    } catch (err) {
      setError('Failed to load blogs. Please try again later.');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
        {error}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 text-lg">No blog posts available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogs.map((blog) => (
        <Link
          key={blog._id}
          href={`/blog/${blog.slug}`}
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1 flex flex-col h-full"
        >
          {blog.featuredImage && (
            <div className="relative h-56 overflow-hidden">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            </div>
          )}
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              {blog.category && (
                <span className="inline-block bg-[#E0F2F1] text-[#1B3B36] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {blog.category}
                </span>
              )}
              {blog.createdAt && (
                <span className="text-xs text-gray-400 font-medium">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#1B3B36] transition-colors">
              {blog.title}
            </h3>

            {blog.excerpt && (
              <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed flex-1">{blog.excerpt}</p>
            )}

            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              {blog.author && (
                <span className="text-sm text-gray-500 font-medium">By {blog.author}</span>
              )}
              <span className="text-[#4CAF50] text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">
                Read Article
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

