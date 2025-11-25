'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import axios from 'axios';
import type { Prescription } from '@/types';
import { toast } from 'react-toastify';

export default function PrescriptionDetailPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const prescriptionId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (prescriptionId) {
      fetchPrescription();
    }
  }, [isAuthenticated, prescriptionId, router]);

  const fetchPrescription = async () => {
    try {
      setLoading(true);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Prescription not found'}
        </div>
      </div>
    );
  }

  const doctor = typeof prescription.doctorId === 'object' ? prescription.doctorId : null;
  const patient = typeof prescription.patientId === 'object' ? prescription.patientId : null;
  const appointment = typeof prescription.appointmentId === 'object' ? prescription.appointmentId : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/prescriptions')}
            className="text-blue-600 hover:text-blue-700 mb-6 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Prescriptions</span>
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Prescription</h1>
                <p className="text-gray-600">
                  Date: {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Print
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6 border-b border-gray-200 pb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Doctor</h3>
                  <p className="text-lg text-gray-900">{doctor?.name || 'N/A'}</p>
                  {/* <p className="text-gray-600">{doctor?.specialization || ''}</p> */}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Patient</h3>
                  <p className="text-lg text-gray-900">{patient?.name || appointment?.patientName || 'N/A'}</p>
                  <p className="text-gray-600">{patient?.email || appointment?.patientEmail || ''}</p>
                </div>
              </div>

              {appointment && (
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Appointment Details</h3>
                  <p className="text-gray-900">
                    Date: {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-900">Time: {appointment.appointmentTime}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medications</h3>
                <div className="space-y-4">
                  {prescription.medications.map((med, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{med.name}</h4>
                        <span className="text-sm text-gray-600">#{index + 1}</span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
                        <div>
                          <span className="font-medium">Dosage:</span> {med.dosage}
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span> {med.frequency}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {med.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {prescription.instructions && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{prescription.instructions}</p>
                </div>
              )}

              {prescription.followUpDate && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow-up Date</h3>
                  <p className="text-gray-700">
                    {new Date(prescription.followUpDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

