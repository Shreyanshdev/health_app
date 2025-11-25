'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import axios from 'axios';
import type { Prescription } from '@/types';
import { toast } from 'react-toastify';
import { PrescriptionForm } from '@/components/forms/PrescriptionForm';
import Link from 'next/link';

function PrescriptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const appointmentId = searchParams.get('appointmentId');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/prescriptions');
      return;
    }
    fetchPrescriptions();
    if (appointmentId) {
      setShowCreateForm(true);
    }
  }, [isAuthenticated, appointmentId, router]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/prescriptions');
      setPrescriptions(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load prescriptions.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isDoctor = user?.role === 'doctor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              {isDoctor ? 'My Prescriptions' : 'My Prescriptions'}
            </h1>
            {isDoctor && appointmentId && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Create Prescription
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
              {error}
            </div>
          )}

          {/* Create Prescription Form (Doctor only) */}
          {showCreateForm && isDoctor && appointmentId && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Create Prescription</h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    router.push('/prescriptions');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <PrescriptionForm
                appointmentId={appointmentId}
                onSuccess={() => {
                  setShowCreateForm(false);
                  fetchPrescriptions();
                  router.push('/prescriptions');
                }}
              />
            </div>
          )}

          {/* Prescriptions List */}
          {prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((prescription) => {
                const doctor = typeof prescription.doctorId === 'object' ? prescription.doctorId : null;
                const appointment = typeof prescription.appointmentId === 'object' ? prescription.appointmentId : null;
                return (
                  <div
                    key={prescription._id}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Prescription #{prescription._id.slice(-6)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Date: {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                        {appointment && (
                          <p className="text-sm text-gray-600">
                            Appointment: {new Date(appointment.appointmentDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/prescriptions/${prescription._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        View Details
                      </Link>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Medications:</h4>
                      <ul className="space-y-2">
                        {prescription.medications.map((med, index) => (
                          <li key={index} className="text-gray-700">
                            <span className="font-medium">{med.name}</span> - {med.dosage}, {med.frequency}, {med.duration}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {prescription.instructions && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Instructions:</h4>
                        <p className="text-gray-700">{prescription.instructions}</p>
                      </div>
                    )}

                    {prescription.followUpDate && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Follow-up Date:</h4>
                        <p className="text-gray-700">
                          {new Date(prescription.followUpDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Prescriptions Found</h3>
              <p className="text-gray-600">
                {isDoctor ? "You haven't created any prescriptions yet." : "You don't have any prescriptions yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PrescriptionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PrescriptionsContent />
    </Suspense>
  );
}

