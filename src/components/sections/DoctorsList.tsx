'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { getApiUrl } from '@/lib/apiHealth';
import type { Doctor } from '@/types';

export function DoctorsList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/doctors');
      setDoctors(response.data);
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string; response?: { status?: number } };
      console.error('Error fetching doctors:', error);

      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please make sure the backend is running on http://localhost:3000');
      } else if (error.response?.status === 404) {
        setError('Doctors endpoint not found. Please check the API configuration.');
      } else {
        setError('Failed to load doctors. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3B36]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold mb-2">Error Loading Doctors</p>
        <p className="text-sm mb-2">{error}</p>
        <p className="text-xs text-gray-600">
          API URL: {getApiUrl()}
        </p>
        <button
          onClick={fetchDoctors}
          className="mt-3 text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 text-lg">No doctors available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {doctors.map((doctor) => {
        const user = typeof doctor.userId === 'object' ? doctor.userId : null;
        return (
          <Link
            key={doctor._id}
            href={`/doctors/${doctor._id}`}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 group hover:-translate-y-1"
          >
            <div className="flex items-start space-x-4">
              {doctor.image ? (
                <img
                  src={doctor.image}
                  alt={doctor.specialization}
                  className="w-24 h-24 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-[#E0F2F1] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-12 h-12 text-[#1B3B36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#1B3B36] transition-colors">
                  {user?.name || 'Dr. Name'}
                </h3>
                <p className="text-[#4CAF50] font-bold text-sm mb-2 uppercase tracking-wide">{doctor.specialization}</p>
                {doctor.qualification && (
                  <p className="text-sm text-gray-600 mb-1 font-medium">{doctor.qualification}</p>
                )}
                {doctor.experience && (
                  <p className="text-sm text-gray-500 mb-2">{doctor.experience} years exp.</p>
                )}
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-4 h-4 ${star <= (doctor.rating || 5) ? 'text-[#FFC107] fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">({doctor.totalReviews || 0})</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[#1B3B36] font-bold text-sm">View Profile</span>
              <div className="bg-[#E0F2F1] p-2 rounded-full group-hover:bg-[#1B3B36] group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

