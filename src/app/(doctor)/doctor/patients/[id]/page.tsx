'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import axios from 'axios';
import type { User, Appointment, Prescription } from '@/types';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { PrescriptionDetailModal } from '@/components/modals/PrescriptionDetailModal';

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showPrescriptionDetailModal, setShowPrescriptionDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: '',
    followUpDate: '',
  });

  useEffect(() => {
    if (id) {
      fetchPatientDetails();
    }
  }, [id]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch patient profile (using profile endpoint for patient by ID)
      const [patientRes, appointmentsRes, prescriptionsRes] = await Promise.all([
        api.get(`/profile/patient/${id}`).catch(() => ({ data: null })),
        api.get('/bookings/doctor-appointments').catch(() => ({ data: [] })),
        api.get('/prescriptions').catch(() => ({ data: [] })),
      ]);

      const patientData = patientRes.data;
      if (!patientData) {
        setError('Patient not found');
        return;
      }

      setPatient(patientData);

      // Filter appointments for this patient
      const allAppointments: Appointment[] = appointmentsRes.data || [];
      const patientAppointments = allAppointments.filter(
        (apt) => (apt.patientId as User)?._id === id || apt.patientId === id
      );
      setAppointments(patientAppointments);

      // Filter prescriptions for this patient
      const allPrescriptions: Prescription[] = prescriptionsRes.data || [];
      const patientPrescriptions = allPrescriptions.filter(
        (pres) => (pres.patientId as User)?._id === id || pres.patientId === id
      );
      setPrescriptions(patientPrescriptions);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load patient details.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      const prescriptionData = {
        appointmentId: selectedAppointment._id,
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
      setSelectedAppointment(null);
      setPrescriptionForm({
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        instructions: '',
        followUpDate: '',
      });
      fetchPatientDetails(); // Refresh data
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
        <button onClick={fetchPatientDetails} className="mt-2 text-blue-600 hover:underline">
          Try Again
        </button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center p-4 text-gray-600">
        <p>Patient not found.</p>
      </div>
    );
  }

  const completedAppointments = appointments.filter(
    (apt) => apt.status === 'completed' && !apt.prescriptionId
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Patient Details</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Back
        </button>
      </div>

      {/* Patient Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Name</p>
            <p className="text-lg text-gray-900 font-medium">{patient.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Email</p>
            <p className="text-lg text-gray-900 font-medium">{patient.email}</p>
          </div>
          {patient.phone && (
            <div>
              <p className="text-sm font-medium text-gray-600">Phone</p>
              <p className="text-lg text-gray-900 font-medium">{patient.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Appointments */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Appointments</h2>
        </div>
        {appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(appointment.appointmentDate), 'PPP')} at{' '}
                      {appointment.appointmentTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.appointmentType === 'online' ? 'Online' : 'In-clinic'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'confirmed'
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {appointment.status === 'completed' && !appointment.prescriptionId && (
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowPrescriptionModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Create Prescription
                        </button>
                      )}
                      {appointment.prescriptionId && (
                        <button
                          onClick={() => {
                            const presId = typeof appointment.prescriptionId === 'object'
                              ? appointment.prescriptionId._id
                              : appointment.prescriptionId;
                            setSelectedPrescriptionId(presId || null);
                            setShowPrescriptionDetailModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          View Prescription
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No appointments found</p>
        )}
      </div>

      {/* Prescriptions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prescriptions</h2>
        {prescriptions.length > 0 ? (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div key={prescription._id} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {format(new Date(prescription.createdAt || ''), 'PPP')}
                    </p>
                    {prescription.instructions && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Instructions:</span> {prescription.instructions}
                      </p>
                    )}
                    {prescription.medications && prescription.medications.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Medications:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {prescription.medications.map((med, index) => (
                            <li key={index}>
                              {med.name} - {med.dosage} ({med.frequency}, {med.duration})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPrescriptionId(prescription._id);
                      setShowPrescriptionDetailModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No prescriptions found</p>
        )}
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && selectedAppointment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Prescription</h2>
            <p className="text-sm text-gray-600 mb-4">
              Appointment: {format(new Date(selectedAppointment.appointmentDate), 'PPP')} at{' '}
              {selectedAppointment.appointmentTime}
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
                    setSelectedAppointment(null);
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

