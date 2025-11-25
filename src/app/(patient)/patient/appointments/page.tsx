'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type { Appointment, Doctor, User } from '@/types';
import { format } from 'date-fns';
import { AppointmentDetailModal } from '@/components/modals/AppointmentDetailModal';
import { Filter, ChevronDown } from 'lucide-react';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

      const response = await api.get('/bookings/my-appointments');
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
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and track all your medical appointments</p>
          </div>
          
          {/* Filter Bar - Inline with Title */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-gray-700 font-medium text-xs sm:text-sm">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-[#1B3B36]" />
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
              <ChevronDown className={`w-4 h-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition cursor-pointer ${
                      statusFilter === option.value ? 'bg-[#E8F5E9] text-[#4CAF50] font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
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
              <ChevronDown className={`w-4 h-4 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showTypeDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTypeFilter(option.value);
                      setShowTypeDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition cursor-pointer ${
                      typeFilter === option.value ? 'bg-[#E8F5E9] text-[#4CAF50] font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
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
              <ChevronDown className={`w-4 h-4 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showDateDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                {dateOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDateFilter(option.value);
                      setShowDateDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition cursor-pointer ${
                      dateFilter === option.value ? 'bg-[#E8F5E9] text-[#4CAF50] font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
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
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-[#4CAF50] hover:text-[#1B3B36] font-bold transition cursor-pointer"
            >
              Clear Filters
            </button>
          )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
        {filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Dr. {((appointment.doctorId as Doctor)?.userId as User)?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(appointment.appointmentDate), 'PPP')} at {appointment.appointmentTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.appointmentType === 'online' ? 'Online' : 'In-clinic'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedAppointmentId(appointment._id);
                          setIsModalOpen(true);
                        }}
                        className="text-[#4CAF50] hover:text-[#1B3B36] font-bold transition cursor-pointer"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {appointments.length === 0 ? 'No appointments found' : 'No appointments match your filters'}
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

      {/* Close dropdowns when clicking outside */}
      {showStatusDropdown || showTypeDropdown || showDateDropdown ? (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowStatusDropdown(false);
            setShowTypeDropdown(false);
            setShowDateDropdown(false);
          }}
        />
      ) : null}
    </div>
  );
}

