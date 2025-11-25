'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type { Doctor, User } from '@/types';
import Link from 'next/link';
import { Search, Star, ChevronDown, Filter } from 'lucide-react';

const DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Gynecology',
  'Psychiatry',
  'Oncology',
  'General Medicine',
  'Dentistry',
  'Ophthalmology',
  'ENT',
];

export default function FindDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/doctors');
      const allDoctors: Doctor[] = response.data || [];
      // Filter by isActive (API already filters, but ensure we only show active doctors)
      const activeDoctors = allDoctors.filter((d) => d.isActive !== false);
      setDoctors(activeDoctors);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load doctors.');
        console.error('Error fetching doctors:', err);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search and department
  const filteredDoctors = useMemo(() => {
    let filtered = [...doctors];

    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter((doctor) =>
        doctor.specialization?.toLowerCase().includes(selectedDepartment.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((doctor) => {
        const userName = (doctor.userId as User)?.name?.toLowerCase() || '';
        const specialization = doctor.specialization?.toLowerCase() || '';
        const qualification = doctor.qualification?.toLowerCase() || '';
        return userName.includes(query) || specialization.includes(query) || qualification.includes(query);
      });
    }

    return filtered;
  }, [doctors, selectedDepartment, searchQuery]);

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
      {/* Header with Filter */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Find Doctors</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Browse and book appointments with qualified healthcare professionals</p>
          </div>
          
          {/* Department Filter - Inline with Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-gray-700 font-medium text-xs sm:text-sm">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-[#1B3B36]" />
              <span className="sm:hidden">Filter:</span>
              <span className="hidden sm:inline">Filter:</span>
            </div>
            <div className="relative">
              <button
                onClick={() => {
                  setShowDepartmentDropdown(!showDepartmentDropdown);
                }}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition cursor-pointer min-w-[140px] sm:min-w-[180px] md:min-w-[200px] justify-between border border-gray-300 focus:ring-2 focus:ring-[#4CAF50] focus:bg-white"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                    {selectedDepartment === 'all' ? 'All Departments' : selectedDepartment}
                  </span>
                </div>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 transition-transform flex-shrink-0 ${showDepartmentDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showDepartmentDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDepartmentDropdown(false)}
                  />
                  <div className="absolute top-full right-0 sm:left-0 mt-2 w-full sm:w-48 md:w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden max-h-80 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedDepartment('all');
                        setShowDepartmentDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition cursor-pointer ${
                        selectedDepartment === 'all' ? 'bg-[#E8F5E9] text-[#4CAF50] font-semibold' : 'text-gray-700'
                      }`}
                    >
                      All Departments
                    </button>
                    {DEPARTMENTS.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setShowDepartmentDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition cursor-pointer ${
                          selectedDepartment === dept ? 'bg-[#E8F5E9] text-[#4CAF50] font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar - Sticky */}
        <div className="sticky top-0 z-30 bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6 border border-gray-100 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search by doctor name, specialization, or qualification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-50 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:bg-white focus:border-[#4CAF50] border border-transparent transition text-gray-900 placeholder-gray-400 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Active Filters */}
          {(selectedDepartment !== 'all' || searchQuery.trim()) && (
            <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
              <span className="text-xs sm:text-sm text-gray-600">Active filters:</span>
              {selectedDepartment !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-[#E8F5E9] text-[#4CAF50] rounded-full text-xs font-semibold">
                  {selectedDepartment}
                  <button
                    onClick={() => setSelectedDepartment('all')}
                    className="ml-1 hover:text-[#1B3B36] cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-[#E8F5E9] text-[#4CAF50] rounded-full text-xs font-semibold">
                  Search: {searchQuery.length > 15 ? `${searchQuery.substring(0, 15)}...` : searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-[#1B3B36] cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedDepartment('all');
                  setSearchQuery('');
                }}
                className="ml-auto text-xs sm:text-sm text-[#4CAF50] hover:text-[#1B3B36] font-bold transition cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Doctors List */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
          {selectedDepartment !== 'all' ? `${selectedDepartment} Doctors` : 'All Doctors'} ({filteredDoctors.length})
        </h2>
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredDoctors.map((doctor) => {
              const user = typeof doctor.userId === 'object' ? doctor.userId : null;
              const profilePicture = doctor.image || user?.profilePicture;
              
              return (
                <div
                  key={doctor._id}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 hover:bg-[#FFF8E1]/30 transition-all duration-300"
                >
                  <div className="p-5 grid grid-cols-[1fr_auto] gap-4">
                    {/* Left Grid - Doctor Details */}
                    <div className="flex flex-col min-w-0">
                      {/* Header with Name and Rating */}
                      <div className="mb-3">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900 truncate pr-2" title={user?.name || 'N/A'}>
                            Dr. {user?.name || 'N/A'}
                          </h3>
                          {doctor.rating && doctor.rating > 0 && (
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium text-gray-700">
                                {doctor.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-[#4CAF50] font-semibold mb-1 truncate" title={doctor.specialization}>
                          {doctor.specialization}
                        </p>
                        {doctor.qualification && (
                          <p className="text-xs text-gray-500 mb-1 truncate" title={doctor.qualification}>
                            {doctor.qualification}
                          </p>
                        )}
                        {doctor.experience && (
                          <p className="text-xs text-gray-500 truncate">
                            {doctor.experience} years exp.
                          </p>
                        )}
                      </div>

                      {/* Bio */}
                      {doctor.bio && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={doctor.bio}>
                          {doctor.bio}
                        </p>
                      )}

                      {/* Consultation Fee */}
                      {doctor.consultationFee && (
                        <p className="text-base font-semibold text-gray-900 mt-auto">
                          ₹{doctor.consultationFee}
                        </p>
                      )}
                    </div>

                    {/* Right Grid - Profile Picture & Button */}
                    <div className="flex flex-col items-center justify-between">
                      {/* Profile Picture */}
                      <div className="mb-3">
                        {profilePicture ? (
                          <img
                            src={profilePicture}
                            alt={user?.name || 'Doctor'}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-[#E0F2F1] flex items-center justify-center">
                            <svg className="w-8 h-8 text-[#1B3B36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* View Profile Button - Rounded, below picture */}
                      <Link
                        href={`/doctors/${doctor._id}`}
                        className="w-full text-center px-3 py-2 border-2 border-[#1B3B36] text-[#1B3B36] bg-transparent rounded-lg hover:bg-[#1B3B36] hover:text-white transition font-semibold text-xs cursor-pointer"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
            <p className="text-gray-600 mb-4">
              {doctors.length === 0 
                ? 'No doctors available at the moment.' 
                : 'No doctors found matching your criteria.'}
            </p>
            {(selectedDepartment !== 'all' || searchQuery.trim()) && (
              <button
                onClick={() => {
                  setSelectedDepartment('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#1B3B36] text-white rounded-lg hover:bg-[#2E5C55] transition font-semibold cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {showDepartmentDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDepartmentDropdown(false)}
        />
      )}
    </div>
  );
}

