'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Blog } from '@/types';

interface BlogDetailProps {
  slug: string;
}

export function BlogDetail({ slug }: BlogDetailProps) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blogs/${slug}`);
      setBlog(response.data);
    } catch (err) {
      setError('Blog post not found');
      console.error('Error fetching blog:', err);
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

  if (error || !blog) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
        {error || 'Blog post not found'}
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-gray-100">
        {/* Header */}
        <header className="mb-8 text-center">
          {blog.category && (
            <span className="inline-block bg-[#E0F2F1] text-[#1B3B36] text-sm font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wide">
              {blog.category}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>
          <div className="flex items-center justify-center space-x-6 text-gray-500 font-medium">
            {blog.author && (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {blog.author}
              </span>
            )}
            {blog.createdAt && (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#FFC107]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="mb-10 -mx-8 md:-mx-12">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-[#1B3B36] prose-a:text-[#4CAF50] prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-[#E0F2F1] hover:text-[#1B3B36] transition-colors cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meta Description */}
        {blog.metaDescription && (
          <div className="mt-8 p-6 bg-[#FFF8E1] rounded-xl border border-[#FFE082]">
            <p className="text-[#1B3B36] italic font-medium">"{blog.metaDescription}"</p>
          </div>
        )}
      </div>
    </article>
  );
}

