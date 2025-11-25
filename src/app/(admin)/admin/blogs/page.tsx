'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type { Blog } from '@/types';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    published: false,
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/blogs');
      setBlogs(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load blogs.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: '',
      tags: '',
      published: false,
    });
    setShowCreateModal(true);
  };

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || '',
      category: blog.category || '',
      tags: blog.tags?.join(', ') || '',
      published: blog.published,
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const blogData = {
        ...formData,
        tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };

      if (selectedBlog) {
        await api.put(`/blogs/${selectedBlog._id}`, blogData);
      } else {
        await api.post('/blogs', blogData);
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setSelectedBlog(null);
      fetchBlogs();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to save blog.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      await api.delete(`/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to delete blog.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Blog Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Create and manage blog posts</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold shadow-sm hover:shadow-md cursor-pointer text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Create New Blog
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:gap-6">
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{blog.title}</h3>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        blog.published
                          ? 'bg-[#E8F5E9] text-[#4CAF50]'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {blog.excerpt && (
                    <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">{blog.excerpt}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    {blog.category && (
                      <span className="capitalize">Category: {blog.category}</span>
                    )}
                    {blog.tags && blog.tags.length > 0 && (
                      <span>Tags: {blog.tags.join(', ')}</span>
                    )}
                    {blog.createdAt && (
                      <span>Created: {format(new Date(blog.createdAt), 'PPP')}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="flex items-center gap-1 px-3 sm:px-4 py-2 text-purple-600 hover:text-white hover:bg-purple-600 rounded-lg transition font-semibold cursor-pointer text-sm sm:text-base"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="flex items-center gap-1 px-3 sm:px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition font-semibold cursor-pointer text-sm sm:text-base"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 border border-gray-100 text-center">
            <p className="text-gray-500 text-sm sm:text-base">No blogs found. Create your first blog post!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-gray-900">
                {selectedBlog ? 'Edit Blog' : 'Create New Blog'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedBlog(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    placeholder="health, wellness, tips"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="published" className="ml-2 text-sm text-gray-700 cursor-pointer">
                  Publish immediately
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition font-semibold cursor-pointer text-sm sm:text-base"
                >
                  {selectedBlog ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedBlog(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 sm:py-3 rounded-lg hover:bg-gray-300 transition font-semibold cursor-pointer text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
