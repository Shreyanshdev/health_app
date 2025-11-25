'use client';

import { useState } from 'react';
import api from '@/lib/api';
import type { Appointment } from '@/types';
import { toast } from 'react-toastify';

interface RescheduleModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

export function RescheduleModal({ appointment, onClose, onSuccess }: RescheduleModalProps) {
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/bookings/${appointment._id}/reschedule`, formData);
      toast.success('Appointment rescheduled successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to reschedule appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
        <h2 id="modal-title" className="text-2xl font-bold text-gray-900 mb-4">Reschedule Appointment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Date *</label>
            <input
              type="date"
              required
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Time *</label>
            <input
              type="time"
              required
              value={formData.appointmentTime}
              onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Rescheduling...' : 'Reschedule'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

