'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import axios from 'axios';
import type { DoctorRegistrationRequest, Doctor } from '@/types';
import { toast } from 'react-toastify';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function DoctorsManagementPage() {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState<DoctorRegistrationRequest[]>([]);
  const [approvedDoctors, setApprovedDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<DoctorRegistrationRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [pendingRes, doctorsRes] = await Promise.all([
        api.get('/auth/pending-doctors'),
        api.get('/doctors'),
      ]);

      setPendingRequests(pendingRes.data);
      setApprovedDoctors(doctorsRes.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load data.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await api.post(`/auth/approve-doctor/${requestId}`);
      toast.success('Doctor approved successfully!');
      fetchData();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to approve doctor.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await api.post(`/auth/reject-doctor/${selectedRequest._id}`, {
        rejectionReason,
      });
      toast.success('Doctor registration rejected.');
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      fetchData();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to reject doctor.');
      } else {
        toast.error('An unexpected error occurred.');
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Doctors Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage doctor registrations and approvals</p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold shadow-sm hover:shadow-md cursor-pointer text-sm sm:text-base"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
          {error}
        </div>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Pending Registration Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => {
              const user = typeof request.userId === 'object' ? request.userId : null;
              return (
                <div
                  key={request._id}
                  className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                        {user?.name || 'Unknown'}
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Email:</span> {user?.email}
                        </div>
                        <div>
                          <span className="font-medium">Specialization:</span> {request.specialization}
                        </div>
                        <div>
                          <span className="font-medium">Qualification:</span> {request.qualification}
                        </div>
                        {request.experience && (
                          <div>
                            <span className="font-medium">Experience:</span> {request.experience} years
                          </div>
                        )}
                      </div>
                      {request.bio && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3">{request.bio}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Requested: {new Date(request.requestedAt || request.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => handleApprove(request._id)}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition font-semibold shadow-sm hover:shadow-md cursor-pointer text-sm sm:text-base"
                      >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectModal(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold shadow-sm hover:shadow-md cursor-pointer text-sm sm:text-base"
                      >
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Approved Doctors */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          Approved Doctors ({approvedDoctors.length})
        </h2>
        {approvedDoctors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Rating
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {approvedDoctors.map((doctor) => {
                  const user = typeof doctor.userId === 'object' ? doctor.userId : null;
                  return (
                    <tr key={doctor._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user?.name || 'N/A'}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{user?.email || ''}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doctor.specialization}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {doctor.rating ? `${doctor.rating}/5 (${doctor.totalReviews || 0} reviews)` : 'No ratings yet'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            doctor.isActive
                              ? 'bg-[#E8F5E9] text-[#4CAF50]'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {doctor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No approved doctors yet</p>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 max-w-md w-full">
            <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Reject Doctor Registration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm text-gray-900"
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 text-white py-2 sm:py-3 rounded-lg hover:bg-red-700 transition font-semibold cursor-pointer text-sm sm:text-base"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 sm:py-3 rounded-lg hover:bg-gray-300 transition font-semibold cursor-pointer text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
