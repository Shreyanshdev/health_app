'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type { Appointment } from '@/types';
import { format } from 'date-fns';
import { RefreshCw, Edit } from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStatus, setEditStatus] = useState<'pending' | 'confirmed' | 'cancelled' | 'completed'>('pending');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/bookings');
      setAppointments(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load appointments.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditStatus(appointment.status || 'pending');
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedAppointment) return;

    try {
      await api.put(`/bookings/${selectedAppointment._id}`, {
        status: editStatus,
      });
      setShowEditModal(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to update appointment.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#E8F5E9] text-[#4CAF50]';
      case 'pending':
        return 'bg-[#FFF8E1] text-[#FFC107]';
      case 'cancelled':
        return 'bg-red-50 text-red-600';
      case 'completed':
        return 'bg-blue-50 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Appointments Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">View and manage all appointments</p>
          </div>
          <button
            onClick={fetchAppointments}
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

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
        {appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Doctor
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Type
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
                {appointments.map((appointment) => {
                  const doctor = typeof appointment.doctorId === 'object' ? appointment.doctorId : null;
                  return (
                    <tr key={appointment._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{appointment.patientEmail}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {doctor?.specialization || 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{format(new Date(appointment.appointmentDate), 'PPP')}</div>
                        <div className="text-xs text-gray-400">{appointment.appointmentTime}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize hidden sm:table-cell">
                        {appointment.appointmentType}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            appointment.status || 'pending'
                          )}`}
                        >
                          {appointment.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(appointment)}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-bold transition cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No appointments found</p>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 max-w-md w-full">
            <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Edit Appointment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as typeof editStatus)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-purple-600 text-white py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition font-semibold cursor-pointer text-sm sm:text-base"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAppointment(null);
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
