'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type { User } from '@/types';
import { CreateAdminForm } from '@/components/admin/CreateAdminForm';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Settings, X } from 'lucide-react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: '' as 'pending' | 'approved' | 'rejected' | '',
  });

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (filterRole !== 'all') params.append('role', filterRole);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await api.get(`/users?${params.toString()}`);
      setUsers(response.data.users || response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load users.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await api.put(`/users/${userId}/status`, { status: newStatus });
      toast.success('User status updated successfully!');
      fetchUsers();
      setShowStatusModal(false);
      setSelectedUser(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to update user status.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      status: user.status || 'approved',
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await api.put(`/users/${selectedUser._id}`, editFormData);
      toast.success('User updated successfully!');
      fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to update user.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to delete user.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const filteredUsers = users;

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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Users Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all users and their permissions</p>
          </div>
          <button
            onClick={() => setShowCreateAdmin(true)}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold shadow-sm hover:shadow-md cursor-pointer text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Create Admin
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6" role="alert">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Role
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize hidden sm:table-cell">
                      {user.role}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'approved'
                            ? 'bg-[#E8F5E9] text-[#4CAF50]'
                            : user.status === 'pending'
                            ? 'bg-[#FFF8E1] text-[#FFC107]'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {user.status || 'approved'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-bold transition cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowStatusModal(true);
                          }}
                          className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 font-bold transition cursor-pointer"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="hidden sm:inline">Status</span>
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
            {users.length === 0 ? 'No users found' : 'No users match the selected filters'}
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Admin</h2>
              <button
                onClick={() => setShowCreateAdmin(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <CreateAdminForm onSuccess={() => {
              setShowCreateAdmin(false);
              fetchUsers();
            }} />
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 max-w-md w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Edit User</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as typeof editFormData.status })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition font-semibold cursor-pointer text-sm sm:text-base"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
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

      {/* Status Update Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 max-w-md w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Update User Status</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              User: {selectedUser.name} ({selectedUser.email})
            </p>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <button
                onClick={() => handleUpdateStatus(selectedUser._id, 'approved')}
                className="w-full bg-[#4CAF50] text-white py-2 sm:py-3 rounded-lg hover:bg-[#45A049] transition font-semibold cursor-pointer text-sm sm:text-base"
              >
                Approve
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedUser._id, 'pending')}
                className="w-full bg-[#FFC107] text-gray-900 py-2 sm:py-3 rounded-lg hover:bg-[#FFD54F] transition font-semibold cursor-pointer text-sm sm:text-base"
              >
                Set to Pending
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedUser._id, 'rejected')}
                className="w-full bg-red-600 text-white py-2 sm:py-3 rounded-lg hover:bg-red-700 transition font-semibold cursor-pointer text-sm sm:text-base"
              >
                Reject
              </button>
            </div>
            <button
              onClick={() => {
                setShowStatusModal(false);
                setSelectedUser(null);
              }}
              className="w-full bg-gray-200 text-gray-800 py-2 sm:py-3 rounded-lg hover:bg-gray-300 transition font-semibold cursor-pointer text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
