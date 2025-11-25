'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type { Prescription, Doctor, User } from '@/types';
import { format } from 'date-fns';
import { PrescriptionDetailModal } from '@/components/modals/PrescriptionDetailModal';
import { Filter, ChevronDown, Calendar } from 'lucide-react';

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter states
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/prescriptions');
      setPrescriptions(response.data || []);
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

  // Get unique doctors from prescriptions
  const uniqueDoctors = useMemo(() => {
    const doctorMap = new Map<string, { id: string; name: string }>();
    prescriptions.forEach((prescription) => {
      let doctorId: string | null = null;
      let doctorName: string = 'N/A';
      
      if (typeof prescription.doctorId === 'object' && prescription.doctorId) {
        doctorId = (prescription.doctorId as User)._id;
        doctorName = (prescription.doctorId as User).name || 'N/A';
      } else if (typeof prescription.doctorId === 'string') {
        doctorId = prescription.doctorId;
      }
      
      if (doctorId && !doctorMap.has(doctorId)) {
        doctorMap.set(doctorId, { id: doctorId, name: doctorName });
      }
    });
    return Array.from(doctorMap.values());
  }, [prescriptions]);

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    let filtered = [...prescriptions];

    // Filter by doctor
    if (doctorFilter !== 'all') {
      filtered = filtered.filter((prescription) => {
        const doctorId = typeof prescription.doctorId === 'object' 
          ? (prescription.doctorId as User)._id 
          : prescription.doctorId;
        return doctorId === doctorFilter;
      });
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter((prescription) => {
        const prescriptionDate = new Date(prescription.datePrescribed || prescription.createdAt || new Date());
        prescriptionDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'today':
            return prescriptionDate.getTime() === now.getTime();
          case 'thisWeek':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return prescriptionDate >= weekAgo;
          case 'thisMonth':
            return prescriptionDate.getMonth() === now.getMonth() && 
                   prescriptionDate.getFullYear() === now.getFullYear();
          case 'past':
            return prescriptionDate < now;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [prescriptions, doctorFilter, dateFilter]);

  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'past', label: 'Past' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3B36]"></div>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">My Prescriptions</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">View and manage all your medical prescriptions</p>
          </div>
          
          {/* Filter Bar - Inline with Title */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-gray-700 font-medium text-xs sm:text-sm">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-[#1B3B36]" />
              <span className="sm:hidden">Filter:</span>
              <span className="hidden sm:inline">Filters:</span>
            </div>
            
            {/* Doctor Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDoctorDropdown(!showDoctorDropdown);
                  setShowDateDropdown(false);
                }}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 transition cursor-pointer min-w-[120px] sm:min-w-[160px] justify-between"
              >
                <span className="truncate">
                  {doctorFilter === 'all' 
                    ? 'All Doctors' 
                    : uniqueDoctors.find(d => d.id === doctorFilter)?.name || 'All Doctors'}
                </span>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 transition-transform flex-shrink-0 ${showDoctorDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showDoctorDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDoctorDropdown(false)}
                  />
                  <div className="absolute top-full right-0 sm:left-0 mt-2 w-full sm:w-48 md:w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden max-h-80 overflow-y-auto">
                    <button
                      onClick={() => {
                        setDoctorFilter('all');
                        setShowDoctorDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition cursor-pointer ${
                        doctorFilter === 'all' ? 'bg-[#E8F5E9] text-[#4CAF50] font-semibold' : 'text-gray-700'
                      }`}
                    >
                      All Doctors
                    </button>
                    {uniqueDoctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => {
                          setDoctorFilter(doctor.id);
                          setShowDoctorDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition cursor-pointer ${
                          doctorFilter === doctor.id ? 'bg-[#E8F5E9] text-[#4CAF50] font-semibold' : 'text-gray-700'
                        }`}
                      >
                        Dr. {doctor.name}
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
                  setShowDoctorDropdown(false);
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
                          dateFilter === option.value ? 'bg-[#E8F5E9] text-[#4CAF50] font-semibold' : 'text-gray-700'
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
            {(doctorFilter !== 'all' || dateFilter !== 'all') && (
              <button
                onClick={() => {
                  setDoctorFilter('all');
                  setDateFilter('all');
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#4CAF50] hover:text-[#1B3B36] font-bold transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
        {filteredPrescriptions.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {filteredPrescriptions.map((prescription, index) => {
              const isEven = index % 2 === 0;
              return (
                <div 
                  key={prescription._id} 
                  className={`border-b border-gray-200 pb-4 sm:pb-6 last:border-0 rounded-lg p-4 sm:p-5 transition-all duration-300 hover:shadow-md ${
                    isEven ? 'hover:bg-[#FFF8E1]/30' : 'hover:bg-red-50/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-3 sm:mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                        Dr. {(prescription.doctorId as User)?.name || 'N/A'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {format(new Date(prescription.datePrescribed || prescription.createdAt || new Date()), 'PPP')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPrescriptionId(prescription._id);
                        setIsModalOpen(true);
                      }}
                      className="px-4 sm:px-5 py-2 border-2 border-[#4CAF50] text-[#4CAF50] bg-transparent rounded-full hover:bg-[#4CAF50] hover:text-white transition font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                  {prescription.diagnosis && (
                    <div className="mb-3">
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Diagnosis:</p>
                      <p className="text-xs sm:text-sm text-gray-600">{prescription.diagnosis}</p>
                    </div>
                  )}
                  {prescription.medications && prescription.medications.length > 0 && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Medications:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {prescription.medications.slice(0, 3).map((med, index) => (
                          <li key={index} className="text-xs sm:text-sm text-gray-600">
                            {med.name} - {med.dosage} {med.instructions && `(${med.instructions})`}
                          </li>
                        ))}
                        {prescription.medications.length > 3 && (
                          <li className="text-xs sm:text-sm text-gray-500 italic">
                            +{prescription.medications.length - 3} more medications
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
            {prescriptions.length === 0 
              ? 'No prescriptions found' 
              : 'No prescriptions match your filters'}
            {(doctorFilter !== 'all' || dateFilter !== 'all') && (
              <button
                onClick={() => {
                  setDoctorFilter('all');
                  setDateFilter('all');
                }}
                className="block mx-auto mt-2 text-[#4CAF50] hover:text-[#1B3B36] font-bold transition cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </p>
        )}
      </div>

      {/* Prescription Detail Modal */}
      {selectedPrescriptionId && (
        <PrescriptionDetailModal
          prescriptionId={selectedPrescriptionId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPrescriptionId(null);
          }}
        />
      )}
    </div>
  );
}

