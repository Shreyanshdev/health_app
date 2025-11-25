'use client';

import { useState } from 'react';
import api from '@/lib/api';
import type { Appointment } from '@/types';
import { toast } from 'react-toastify';

interface CancelAppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelAppointmentModal({ appointment, onClose, onSuccess }: CancelAppointmentModalProps) {
  const [cancellationReason, setCancellationReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    setLoading(true);

    try {
      await api.put(`/bookings/${appointment._id}/cancel`, {
        cancellationReason,
      });
      toast.success('Appointment cancelled successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to cancel appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
        <h2 id="modal-title" className="text-2xl font-bold text-gray-900 mb-4">Cancel Appointment</h2>
        <p className="text-gray-600 mb-4">Are you sure you want to cancel this appointment?</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Please provide a reason for cancellation..."
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Cancelling...' : 'Cancel Appointment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Keep Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

