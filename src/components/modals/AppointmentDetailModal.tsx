'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type { Appointment, User, Doctor, Prescription } from '@/types';
import { format } from 'date-fns';
import { X, Calendar, Clock, User as UserIcon, MapPin, FileText, Stethoscope, MessageSquare, ExternalLink } from 'lucide-react';
import { RescheduleModal } from './RescheduleModal';
import { CancelAppointmentModal } from './CancelAppointmentModal';
import { ReviewForm } from '@/components/forms/ReviewForm';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface AppointmentDetailModalProps {
  appointmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function AppointmentDetailModal({ appointmentId, isOpen, onClose, onUpdate }: AppointmentDetailModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const isDoctor = user?.role === 'doctor';

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchAppointment();
    } else {
      setAppointment(null);
      setError('');
      setLoading(true);
    }
  }, [isOpen, appointmentId]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      setError('');
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
    if (onUpdate) onUpdate();
    toast.success('Appointment rescheduled successfully!');
  };

  const handleCancelSuccess = () => {
    setShowCancel(false);
    fetchAppointment();
    if (onUpdate) onUpdate();
    toast.success('Appointment cancelled successfully!');
  };

  const handleReviewSuccess = () => {
    setShowReview(false);
    toast.success('Review submitted successfully!');
  };

  if (!isOpen) return null;

  const doctor = typeof appointment?.doctorId === 'object' ? appointment.doctorId : null;
  const doctorUser = doctor && typeof doctor.userId === 'object' ? doctor.userId : null;
  
  // Fallback: Try to get doctor name from different possible structures
  const getDoctorName = () => {
    if (doctorUser?.name) return doctorUser.name;
    if (doctor && typeof doctor.userId === 'object' && (doctor.userId as User)?.name) {
      return (doctor.userId as User).name;
    }
    if (doctor && typeof doctor.userId === 'string') {
      // If userId is just an ID string, we can't get the name without another API call
      return 'N/A';
    }
    return 'N/A';
  };
  const appointmentDate = appointment ? new Date(appointment.appointmentDate) : null;
  const isPast = appointmentDate ? appointmentDate < new Date() : false;
  const canModify = appointment && !isPast && appointment.status !== 'cancelled' && appointment.status !== 'completed';
  
  const canCreatePrescription = (appointment: Appointment) => {
    if (!isDoctor) return false;
    const prescriptionId = appointment.prescriptionId
      ? (typeof appointment.prescriptionId === 'object' && appointment.prescriptionId !== null
        ? (appointment.prescriptionId as Prescription)._id
        : appointment.prescriptionId)
      : null;
    return (appointment.status === 'completed' || appointment.status === 'confirmed') && !prescriptionId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#FFF8E1] text-[#FFC107] border-[#FFC107]/20';
      case 'confirmed':
        return 'bg-[#E8F5E9] text-[#4CAF50] border-[#4CAF50]/20';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'completed':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-100 my-4 sm:my-0">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#1B3B36] to-[#2E5C55] text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl flex justify-between items-start z-10">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">Appointment Details</h2>
              {appointment && (
                <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3B36]"></div>
              </div>
            ) : error || !appointment ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                {error || 'Appointment not found'}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Doctor & Appointment Info Cards */}
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-[#E8F5E9] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#4CAF50] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Doctor Information</h3>
                    </div>
                    <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                      {getDoctorName()}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{doctor?.specialization || 'N/A'}</p>
                    {doctor?.qualification && (
                      <p className="text-xs text-gray-500 mb-2 sm:mb-3">{doctor.qualification}</p>
                    )}
                    {doctor && (
                      <Link
                        href={`/doctors/${doctor._id}`}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1B3B36] text-white rounded-full hover:bg-[#2E5C55] transition text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md cursor-pointer"
                      >
                        View Doctor Profile
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Link>
                    )}
                  </div>

                  <div className="bg-[#FFF8E1] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFC107] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Appointment Details</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-900 font-medium">
                          {appointmentDate ? format(appointmentDate, 'PPP') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-900 font-medium">{appointment.appointmentTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-900 font-medium capitalize">
                          {appointment.appointmentType === 'online' ? 'Online Consultation' : 'In-Clinic Visit'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Symptoms */}
                {appointment.symptoms && (
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#1B3B36] flex-shrink-0" />
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Symptoms / Reason</h3>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{appointment.symptoms}</p>
                  </div>
                )}

                {/* Doctor Notes */}
                {(appointment.consultationNotes || appointment.notes) && (
                  <div className="bg-[#E3F2FD] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Doctor Notes</h3>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {appointment.consultationNotes || appointment.notes}
                    </p>
                  </div>
                )}

                {/* Cancellation Reason */}
                {appointment.cancellationReason && (
                  <div className="bg-red-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-red-200 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-red-700 mb-2">Cancellation Reason</h3>
                    <p className="text-sm sm:text-base text-red-600">{appointment.cancellationReason}</p>
                  </div>
                )}

                {/* Review Section */}
                {appointment.status === 'completed' && !showReview && (
                  <div className="pt-3 sm:pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowReview(true)}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-[#4CAF50] text-white rounded-full hover:bg-[#45A049] transition font-semibold text-sm sm:text-base shadow-sm hover:shadow-md cursor-pointer"
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
                      onSuccess={handleReviewSuccess}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3 sm:p-4 md:p-6 rounded-b-2xl sm:rounded-b-3xl flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              {canModify && (
                <>
                  <button
                    onClick={() => setShowReschedule(true)}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-[#FFC107] text-gray-900 rounded-full hover:bg-[#FFB300] transition font-semibold text-sm sm:text-base shadow-sm hover:shadow-md cursor-pointer"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => setShowCancel(true)}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition font-semibold text-sm sm:text-base shadow-sm hover:shadow-md cursor-pointer"
                  >
                    Cancel Appointment
                  </button>
                </>
              )}
              {appointment && canCreatePrescription(appointment) && (
                <button
                  onClick={() => {
                    onClose();
                    router.push(`/doctor/appointments/${appointment._id}`);
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition font-semibold text-sm sm:text-base shadow-sm hover:shadow-md cursor-pointer"
                >
                  Create Prescription
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-[#1B3B36] text-white rounded-full hover:bg-[#2E5C55] transition font-semibold text-sm sm:text-base shadow-sm hover:shadow-md cursor-pointer w-full sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showReschedule && appointment && (
        <RescheduleModal
          appointment={appointment}
          onClose={() => setShowReschedule(false)}
          onSuccess={handleRescheduleSuccess}
        />
      )}

      {/* Cancel Modal */}
      {showCancel && appointment && (
        <CancelAppointmentModal
          appointment={appointment}
          onClose={() => setShowCancel(false)}
          onSuccess={handleCancelSuccess}
        />
      )}
    </>
  );
}

