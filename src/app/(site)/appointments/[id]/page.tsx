'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import axios from 'axios';
import type { Appointment } from '@/types';
import { toast } from 'react-toastify';
import { RescheduleModal } from '@/components/modals/RescheduleModal';
import { CancelAppointmentModal } from '@/components/modals/CancelAppointmentModal';
import { ReviewForm } from '@/components/forms/ReviewForm';

function AppointmentDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const appointmentId = params?.id as string || '';
  const action = searchParams.get('action');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (appointmentId) {
      fetchAppointment();
    }
    if (action === 'reschedule') setShowReschedule(true);
    if (action === 'cancel') setShowCancel(true);
    if (action === 'review') setShowReview(true);
  }, [isAuthenticated, appointmentId, action, router]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      setError('');
      // Use direct appointment endpoint which supports patient access
      const response = await api.get(`/bookings/${appointmentId}`);
      setAppointment(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load appointment.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleSuccess = () => {
    setShowReschedule(false);
    fetchAppointment();
    toast.success('Appointment rescheduled successfully!');
  };

  const handleCancelSuccess = () => {
    setShowCancel(false);
    fetchAppointment();
    toast.success('Appointment cancelled successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Appointment not found'}
        </div>
      </div>
    );
  }

  const doctor = typeof appointment.doctorId === 'object' ? appointment.doctorId : null;
  const doctorUser = doctor && typeof doctor.userId === 'object' ? doctor.userId : null;
  const appointmentDate = new Date(appointment.appointmentDate);
  const isPast = appointmentDate < new Date();
  const canModify = !isPast && appointment.status !== 'cancelled' && appointment.status !== 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/appointments')}
            className="text-blue-600 hover:text-blue-700 mb-6 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Appointments</span>
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Details</h1>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : appointment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : appointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {appointment.status}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Doctor Information</h3>
                  <p className="text-lg text-gray-900">{doctorUser?.name || 'N/A'}</p>
                  <p className="text-gray-600">{doctor?.specialization || 'N/A'}</p>
                  {doctor?.qualification && (
                    <p className="text-sm text-gray-500 mt-1">{doctor.qualification}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Appointment Details</h3>
                  <p className="text-gray-900">
                    <span className="font-medium">Date:</span>{' '}
                    {appointmentDate.toLocaleDateString()}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-medium">Time:</span> {appointment.appointmentTime}
                  </p>
                  <p className="text-gray-900 capitalize">
                    <span className="font-medium">Type:</span> {appointment.appointmentType}
                  </p>
                </div>
              </div>

              {appointment.symptoms && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Symptoms / Reason</h3>
                  <p className="text-gray-900">{appointment.symptoms}</p>
                </div>
              )}

              {(appointment.consultationNotes || appointment.notes) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Doctor Notes</h3>
                  <p className="text-gray-900">{appointment.consultationNotes || appointment.notes}</p>
                </div>
              )}

              {appointment.cancellationReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-700 mb-2">Cancellation Reason</h3>
                  <p className="text-red-600">{appointment.cancellationReason}</p>
                </div>
              )}

              {canModify && (
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowReschedule(true)}
                    className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => setShowCancel(true)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Cancel Appointment
                  </button>
                </div>
              )}

              {appointment.status === 'completed' && !showReview && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowReview(true)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Add Review
                  </button>
                </div>
              )}

              {showReview && appointment.status === 'completed' && (
                <div className="pt-4 border-t border-gray-200">
                  <ReviewForm
                    appointmentId={appointment._id}
                    doctorId={typeof appointment.doctorId === 'object' ? appointment.doctorId._id : appointment.doctorId}
                    onSuccess={() => {
                      setShowReview(false);
                      toast.success('Review submitted successfully!');
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReschedule && (
        <RescheduleModal
          appointment={appointment}
          onClose={() => setShowReschedule(false)}
          onSuccess={handleRescheduleSuccess}
        />
      )}

      {showCancel && (
        <CancelAppointmentModal
          appointment={appointment}
          onClose={() => setShowCancel(false)}
          onSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
}

export default function AppointmentDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AppointmentDetailContent />
    </Suspense>
  );
}

