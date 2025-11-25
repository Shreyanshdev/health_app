'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import axios from 'axios';
import type { Appointment, User, Prescription } from '@/types';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { PrescriptionDetailModal } from '@/components/modals/PrescriptionDetailModal';

export default function DoctorAppointmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showPrescriptionDetailModal, setShowPrescriptionDetailModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: '',
    followUpDate: '',
  });

  useEffect(() => {
    if (id) {
      fetchAppointmentDetails();
    }
  }, [id]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/bookings/${id}`);
      setAppointment(response.data);
      setConsultationNotes(response.data.consultationNotes || '');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load appointment details.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddNotes = async () => {
    try {
      await api.put(`/bookings/${id}/consultation-notes`, { consultationNotes });
      toast.success('Consultation notes added successfully!', { position: 'top-right' });
      setShowNotesModal(false);
      fetchAppointmentDetails();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to add notes.', { position: 'top-right' });
      } else {
        toast.error('An unexpected error occurred.', { position: 'top-right' });
      }
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    try {
      const prescriptionData = {
        appointmentId: appointment._id,
        medications: prescriptionForm.medications.filter(
          (med) => med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
        ),
        instructions: prescriptionForm.instructions,
        followUpDate: prescriptionForm.followUpDate || null,
      };

      if (prescriptionData.medications.length === 0) {
        toast.error('Please add at least one medication');
        return;
      }

      await api.post('/prescriptions', prescriptionData);
      toast.success('Prescription created successfully! Patient will be notified.', {
        position: 'top-right',
      });
      setShowPrescriptionModal(false);
      setPrescriptionForm({
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        instructions: '',
        followUpDate: '',
      });
      fetchAppointmentDetails(); // Refresh data
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to create prescription.', {
          position: 'top-right',
        });
      } else {
        toast.error('An unexpected error occurred.', { position: 'top-right' });
      }
    }
  };

  const handleMarkCompleted = async () => {
    try {
      await api.put(`/bookings/${id}/complete`);
      toast.success('Appointment marked as completed!', { position: 'top-right' });
      fetchAppointmentDetails();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to mark appointment as completed.', {
          position: 'top-right',
        });
      } else {
        toast.error('An unexpected error occurred.', { position: 'top-right' });
      }
    }
  };

  const addMedicationField = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: [...prescriptionForm.medications, { name: '', dosage: '', frequency: '', duration: '' }],
    });
  };

  const removeMedicationField = (index: number) => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: prescriptionForm.medications.filter((_, i) => i !== index),
    });
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = [...prescriptionForm.medications];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptionForm({ ...prescriptionForm, medications: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
        <p>{error}</p>
        <button onClick={fetchAppointmentDetails} className="mt-2 text-blue-600 hover:underline">
          Try Again
        </button>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center p-4 text-gray-600">
        <p>Appointment not found.</p>
      </div>
    );
  }

  // Check if prescription exists (could be ObjectId string or populated object)
  const prescriptionId = appointment.prescriptionId
    ? (typeof appointment.prescriptionId === 'object' && appointment.prescriptionId !== null
      ? (appointment.prescriptionId as Prescription)._id
      : appointment.prescriptionId)
    : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 space-y-6">
        {/* Appointment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Appointment ID</p>
            <p className="text-lg text-gray-900 font-medium">{appointment._id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Status</p>
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${appointment.status === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : appointment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : appointment.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
            >
              {appointment.status}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Date</p>
            <p className="text-lg text-gray-900 font-medium">
              {format(new Date(appointment.appointmentDate), 'PPP')}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Time</p>
            <p className="text-lg text-gray-900 font-medium">{appointment.appointmentTime}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Type</p>
            <p className="text-lg text-gray-900 font-medium capitalize">{appointment.appointmentType}</p>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Patient Information */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Patient Name</p>
              <p className="text-lg text-gray-900 font-medium">{appointment.patientName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Patient Email</p>
              <p className="text-lg text-gray-900 font-medium">{appointment.patientEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Patient Phone</p>
              <p className="text-lg text-gray-900 font-medium">{appointment.patientPhone}</p>
            </div>
          </div>
        </div>

        {appointment.symptoms && (
          <>
            <hr className="border-gray-200" />
            <div>
              <p className="text-sm font-medium text-gray-600">Symptoms</p>
              <p className="text-lg text-gray-900 font-medium">{appointment.symptoms}</p>
            </div>
          </>
        )}

        {appointment.consultationNotes && (
          <>
            <hr className="border-gray-200" />
            <div>
              <p className="text-sm font-medium text-gray-600">Consultation Notes</p>
              <p className="text-lg text-gray-900 font-medium">{appointment.consultationNotes}</p>
            </div>
          </>
        )}

        {prescriptionId && (
          <>
            <hr className="border-gray-200" />
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Prescription</p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setSelectedPrescriptionId(prescriptionId);
                    setShowPrescriptionDetailModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-900 text-lg font-medium underline"
                >
                  View Prescription Details
                </button>
                <span className="text-green-600 font-semibold">✓ Prescription Created</span>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 pt-6">
          {/* Actions for non-completed, non-cancelled appointments */}
          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
            <>
              <button
                onClick={() => setShowNotesModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                {appointment.consultationNotes ? 'Edit Notes' : 'Add Consultation Notes'}
              </button>
              <button
                onClick={handleMarkCompleted}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Mark as Completed
              </button>
            </>
          )}

          {/* Actions for completed appointments */}
          {appointment.status === 'completed' && (
            <>
              {!prescriptionId && (
                <button
                  onClick={() => setShowPrescriptionModal(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Create Prescription
                </button>
              )}
              <button
                onClick={() => setShowNotesModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                {appointment.consultationNotes ? 'Edit Notes' : 'Add Consultation Notes'}
              </button>
            </>
          )}

          {/* Allow creating prescription for confirmed appointments too */}
          {appointment.status === 'confirmed' && !prescriptionId && (
            <button
              onClick={() => setShowPrescriptionModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Create Prescription
            </button>
          )}
        </div>
      </div>

      {/* Consultation Notes Modal */}
      {showNotesModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Consultation Notes</h2>
            <textarea
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Enter consultation notes..."
            />
            <div className="flex space-x-3">
              <button
                onClick={handleAddNotes}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Save Notes
              </button>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setConsultationNotes(appointment.consultationNotes || '');
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && appointment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Prescription</h2>
            <p className="text-sm text-gray-600 mb-4">
              Appointment: {format(new Date(appointment.appointmentDate), 'PPP')} at{' '}
              {appointment.appointmentTime}
            </p>

            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
                {prescriptionForm.medications.map((med, index) => (
                  <div key={index} className="mb-3 p-3 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Medication name"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Dosage (e.g., 500mg)"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Frequency (e.g., Twice daily)"
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Duration (e.g., 7 days)"
                          required
                        />
                        {prescriptionForm.medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicationField(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMedicationField}
                  className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm"
                >
                  + Add Medication
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                <textarea
                  value={prescriptionForm.instructions}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional instructions for the patient"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date (Optional)</label>
                <input
                  type="date"
                  value={prescriptionForm.followUpDate}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, followUpDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Create Prescription
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setPrescriptionForm({
                      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
                      instructions: '',
                      followUpDate: '',
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Detail Modal */}
      {showPrescriptionDetailModal && selectedPrescriptionId && (
        <PrescriptionDetailModal
          prescriptionId={selectedPrescriptionId}
          isOpen={showPrescriptionDetailModal}
          onClose={() => {
            setShowPrescriptionDetailModal(false);
            setSelectedPrescriptionId(null);
          }}
        />
      )}
    </div>
  );
}

