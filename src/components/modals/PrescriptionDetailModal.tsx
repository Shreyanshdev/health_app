'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type { Prescription, User, Doctor, Appointment } from '@/types';
import { format } from 'date-fns';
import { X, Printer, Calendar, User as UserIcon, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PrescriptionDetailModalProps {
  prescriptionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PrescriptionDetailModal({ prescriptionId, isOpen, onClose }: PrescriptionDetailModalProps) {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && prescriptionId) {
      fetchPrescription();
    } else {
      // Reset state when modal closes
      setPrescription(null);
      setError('');
      setLoading(true);
    }
  }, [isOpen, prescriptionId]);

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/prescriptions/${prescriptionId}`);
      setPrescription(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load prescription.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[85vh] overflow-y-auto border border-gray-100 my-4 sm:my-0">
        {/* Header - Elegant and refined */}
        <div className="sticky top-0 bg-gradient-to-r from-[#1B3B36] to-[#2E5C55] text-white p-4 sm:p-5 rounded-t-2xl sm:rounded-t-3xl flex justify-between items-center z-10">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-lg sm:text-xl font-bold mb-1">Prescription Details</h2>
            {prescription && (
              <p className="text-gray-200 text-xs flex items-center gap-1.5">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="truncate">{prescription.createdAt ? format(new Date(prescription.createdAt), 'PPP') : 'N/A'}</span>
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handlePrint}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition cursor-pointer"
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content - Elegant spacing and refined design */}
        <div className="p-4 sm:p-5 md:p-6 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3B36]"></div>
            </div>
          ) : error || !prescription ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
              {error || 'Prescription not found'}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Doctor & Patient Info Cards - Elegant and compact */}
              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-[#E8F5E9] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#4CAF50] rounded-lg flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">Doctor</h3>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">
                    {(() => {
                      // Try to get doctor name from different possible structures
                      if (typeof prescription.doctorId === 'object' && prescription.doctorId) {
                        const doctorObj = prescription.doctorId as any;
                        // Check if it's a Doctor object (has userId property)
                        if (doctorObj.userId) {
                          // Check if userId is populated as an object
                          if (typeof doctorObj.userId === 'object' && doctorObj.userId.name) {
                            return doctorObj.userId.name;
                          }
                        }
                        // Fallback: try to get from appointment
                        if (typeof prescription.appointmentId === 'object' && prescription.appointmentId) {
                          const appointment = prescription.appointmentId as any;
                          if (appointment.doctorId && typeof appointment.doctorId === 'object') {
                            const appointmentDoctor = appointment.doctorId;
                            if (appointmentDoctor.userId && typeof appointmentDoctor.userId === 'object' && appointmentDoctor.userId.name) {
                              return appointmentDoctor.userId.name;
                            }
                          }
                        }
                      }
                      return 'N/A';
                    })()}
                  </p>
                  {(() => {
                    // Get doctor ID from appointment if available, otherwise try to get from doctorId
                    let doctorId: string | null = null;
                    if (typeof prescription.appointmentId === 'object' && prescription.appointmentId) {
                      const appointmentDoctor = (prescription.appointmentId as Appointment).doctorId;
                      if (typeof appointmentDoctor === 'object') {
                        doctorId = (appointmentDoctor as Doctor)._id;
                      } else if (typeof appointmentDoctor === 'string') {
                        doctorId = appointmentDoctor;
                      }
                    }
                    return doctorId ? (
                      <Link
                        href={`/doctors/${doctorId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3B36] text-white rounded-full hover:bg-[#2E5C55] transition text-xs font-semibold shadow-sm hover:shadow-md cursor-pointer"
                      >
                        View Profile
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : null;
                  })()}
                </div>
                <div className="bg-[#FFF8E1] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFC107] rounded-lg flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">Patient</h3>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    {typeof prescription.patientId === 'object' && prescription.patientId
                      ? (prescription.patientId as User).name || 'N/A'
                      : typeof prescription.appointmentId === 'object' && prescription.appointmentId
                        ? (prescription.appointmentId as Appointment).patientName || 'N/A'
                        : 'N/A'}
                  </p>
                  {typeof prescription.patientId === 'object' && prescription.patientId && (
                    <p className="text-gray-600 text-xs mt-1.5">
                      {(prescription.patientId as User).email || ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              {typeof prescription.appointmentId === 'object' && prescription.appointmentId && (
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                  <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#1B3B36] flex-shrink-0" />
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">Appointment Details</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Date:</span>{' '}
                      <span className="text-gray-900">
                        {format(new Date((prescription.appointmentId as Appointment).appointmentDate), 'PPP')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Time:</span>{' '}
                      <span className="text-gray-900">
                        {(prescription.appointmentId as Appointment).appointmentTime}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Medications */}
              <div>
                <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#1B3B36] flex-shrink-0" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Medications</h3>
                </div>
                <div className="space-y-3">
                  {prescription.medications.map((med, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm hover:shadow transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <h4 className="text-sm sm:text-base font-bold text-gray-900">{med.name}</h4>
                        <span className="bg-[#1B3B36] text-white text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-2 sm:gap-3">
                        <div className="bg-[#E8F5E9] rounded-lg p-2 sm:p-3">
                          <span className="font-medium text-gray-700 block mb-1 text-xs">Dosage</span>
                          <span className="text-gray-900 text-xs sm:text-sm font-medium">{med.dosage}</span>
                        </div>
                        <div className="bg-[#FFF8E1] rounded-lg p-2 sm:p-3">
                          <span className="font-medium text-gray-700 block mb-1 text-xs">Frequency</span>
                          <span className="text-gray-900 text-xs sm:text-sm font-medium">{med.frequency}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                          <span className="font-medium text-gray-700 block mb-1 text-xs">Duration</span>
                          <span className="text-gray-900 text-xs sm:text-sm font-medium">{med.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              {prescription.instructions && (
                <div className="bg-[#FFF8E1] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <div className="w-1 h-3 sm:h-4 bg-[#FFC107] rounded-full flex-shrink-0"></div>
                    Instructions
                  </h3>
                  <p className="text-gray-700 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {prescription.instructions}
                  </p>
                </div>
              )}

              {/* Follow-up Date */}
              {prescription.followUpDate && (
                <div className="bg-[#E8F5E9] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#4CAF50] flex-shrink-0" />
                    Follow-up Date
                  </h3>
                  <p className="text-gray-900 text-sm sm:text-base font-semibold">
                    {format(new Date(prescription.followUpDate), 'PPP')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3 sm:p-4 rounded-b-2xl sm:rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#1B3B36] text-white rounded-full hover:bg-[#2E5C55] transition font-semibold text-sm shadow-sm hover:shadow-md cursor-pointer w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

