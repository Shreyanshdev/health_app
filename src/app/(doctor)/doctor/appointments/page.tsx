'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type { Appointment, User, Prescription } from '@/types';
import { format } from 'date-fns';
import { AppointmentDetailModal } from '@/components/modals/AppointmentDetailModal';
import { Filter, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: '',
    followUpDate: '',
  });
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/bookings/doctor-appointments');
      setAppointments(response.data || []);
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

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      // Status filter
      if (statusFilter !== 'all' && appointment.status !== statusFilter) {
        return false;
      }
      
      // Type filter
      if (typeFilter !== 'all' && appointment.appointmentType !== typeFilter) {
        return false;
      }
      
      // Date filter
      if (dateFilter !== 'all') {
        const appointmentDate = new Date(appointment.appointmentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        switch (dateFilter) {
          case 'today':
            if (appointmentDate.toDateString() !== today.toDateString()) return false;
            break;
          case 'upcoming':
            if (appointmentDate < today) return false;
            break;
          case 'past':
            if (appointmentDate >= today) return false;
            break;
          case 'thisWeek':
            if (appointmentDate < today || appointmentDate >= nextWeek) return false;
            break;
        }
      }
      
      return true;
    });
  }, [appointments, statusFilter, typeFilter, dateFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#FFF8E1] text-[#FFC107]';
      case 'confirmed':
        return 'bg-[#E8F5E9] text-[#4CAF50]';
      case 'cancelled':
        return 'bg-red-50 text-red-600';
      case 'completed':
        return 'bg-blue-50 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'online', label: 'Online' },
    { value: 'in-clinic', label: 'In-Clinic' },
  ];

  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'past', label: 'Past' },
  ];

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
      fetchAppointments(); // Refresh data
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

  const canCreatePrescription = (appointment: Appointment) => {
    const prescriptionId = appointment.prescriptionId
      ? (typeof appointment.prescriptionId === 'object' && appointment.prescriptionId !== null
        ? (appointment.prescriptionId as Prescription)._id
        : appointment.prescriptionId)
      : null;
    return (appointment.status === 'completed' || appointment.status === 'confirmed') && !prescriptionId;
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header with Filters */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and track all your appointments</p>
          </div>
          
          {/* Filter Bar - Inline with Title */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-gray-700 font-medium text-xs sm:text-sm">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              <span className="sm:hidden">Filter:</span>
              <span className="hidden sm:inline">Filters:</span>
            </div>
          
          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowTypeDropdown(false);
                setShowDateDropdown(false);
              }}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 transition cursor-pointer min-w-[120px] sm:min-w-[140px] justify-between"
            >
              <span>{statusOptions.find(opt => opt.value === statusFilter)?.label || 'All Status'}</span>
              <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 transition-transform flex-shrink-0 ${showStatusDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showStatusDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowStatusDropdown(false)}
                />
                <div className="absolute top-full right-0 sm:left-0 mt-2 w-full sm:w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition cursor-pointer ${
                        statusFilter === option.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Type Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTypeDropdown(!showTypeDropdown);
                setShowStatusDropdown(false);
                setShowDateDropdown(false);
              }}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 transition cursor-pointer min-w-[120px] sm:min-w-[140px] justify-between"
            >
              <span>{typeOptions.find(opt => opt.value === typeFilter)?.label || 'All Types'}</span>
              <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 transition-transform flex-shrink-0 ${showTypeDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showTypeDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowTypeDropdown(false)}
                />
                <div className="absolute top-full right-0 sm:left-0 mt-2 w-full sm:w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTypeFilter(option.value);
                        setShowTypeDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition cursor-pointer ${
                        typeFilter === option.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Date Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDateDropdown(!showDateDropdown);
                setShowStatusDropdown(false);
                setShowTypeDropdown(false);
              }}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 transition cursor-pointer min-w-[120px] sm:min-w-[140px] justify-between"
            >
              <span>{dateOptions.find(opt => opt.value === dateFilter)?.label || 'All Dates'}</span>
              <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 transition-transform flex-shrink-0 ${showDateDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showDateDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDateDropdown(false)}
                />
                <div className="absolute top-full right-0 sm:left-0 mt-2 w-full sm:w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                  {dateOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDateFilter(option.value);
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition cursor-pointer ${
                        dateFilter === option.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Clear Filters */}
          {(statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setDateFilter('all');
              }}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-bold transition cursor-pointer"
            >
              Clear
            </button>
          )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
        {filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {appointment.patientName}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(appointment.appointmentDate), 'PPP')} at {appointment.appointmentTime}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {appointment.appointmentType === 'online' ? 'Online' : 'In-Clinic'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {canCreatePrescription(appointment) && (
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowPrescriptionModal(true);
                            }}
                            className="text-green-600 hover:text-green-700 font-bold transition cursor-pointer text-xs sm:text-sm"
                          >
                            Prescribe
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAppointmentId(appointment._id);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 font-bold transition cursor-pointer"
                        >
                          View →
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
            {appointments.length === 0 ? 'No appointments found' : 'No appointments match your filters'}
            {(statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all') && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setDateFilter('all');
                }}
                className="block mx-auto mt-2 text-blue-600 hover:text-blue-700 font-bold transition cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </p>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointmentId && (
        <AppointmentDetailModal
          appointmentId={selectedAppointmentId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAppointmentId(null);
          }}
          onUpdate={fetchAppointments}
        />
      )}

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
    </div>
  );
}
