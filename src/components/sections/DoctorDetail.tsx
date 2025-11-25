'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { Doctor } from '@/types';
import { ReviewsList } from './ReviewsList';

interface DoctorDetailProps {
  doctorId: string;
}

export function DoctorDetail({ doctorId }: DoctorDetailProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/doctors/${doctorId}`);
      setDoctor(response.data);
    } catch (err) {
      setError('Doctor not found');
      console.error('Error fetching doctor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    if (doctor) {
      // Check if user is logged in
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          // Not logged in - redirect to login with redirect URL
          router.push(`/login?redirect=${encodeURIComponent(`/book-appointment?doctorId=${doctor._id}`)}`);
        } else {
          // Logged in - go to booking page
          router.push(`/book-appointment?doctorId=${doctor._id}`);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
        {error || 'Doctor not found'}
      </div>
    );
  }

  const user = typeof doctor.userId === 'object' ? doctor.userId : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-10 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Doctor Image */}
          <div className="flex-shrink-0">
            {doctor.image ? (
              <img
                src={doctor.image}
                alt={doctor.specialization}
                className="w-48 h-48 md:w-56 md:h-56 rounded-2xl object-cover mx-auto md:mx-0 shadow-lg"
              />
            ) : (
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-[#E0F2F1] flex items-center justify-center mx-auto md:mx-0 shadow-lg">
                <svg className="w-24 h-24 text-[#1B3B36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* Doctor Info */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {user?.name || 'Dr. Name'}
              </h1>
              <p className="text-xl text-[#4CAF50] font-bold uppercase tracking-wide">
                {doctor.specialization}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {doctor.qualification && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Qualifications</h3>
                  <p className="text-gray-900 font-medium">{doctor.qualification}</p>
                </div>
              )}
              {doctor.experience && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Experience</h3>
                  <p className="text-gray-900 font-medium">{doctor.experience} years</p>
                </div>
              )}
            </div>

            {/* Rating */}
            {doctor.rating && doctor.rating > 0 && (
              <div className="mb-6 flex items-center space-x-3">
                <div className="flex bg-[#FFF8E1] px-3 py-1 rounded-full">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(doctor.rating || 0)
                          ? 'text-[#FFC107] fill-current'
                          : 'text-gray-300'
                        }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-gray-900 font-bold ml-2">{doctor.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  ({doctor.totalReviews || 0} reviews)
                </span>
              </div>
            )}

            {doctor.consultationFee && (
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-1">Consultation Fee</p>
                <p className="text-3xl font-bold text-[#1B3B36]">₹{doctor.consultationFee}</p>
              </div>
            )}

            {/* Book Appointment Button */}
            <button
              onClick={handleBookAppointment}
              className="w-full bg-[#1B3B36] text-white px-8 py-4 rounded-xl hover:bg-[#2E5C55] transition font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Book Appointment
            </button>
          </div>
        </div>

        {/* About & Availability */}
        <div className="mt-12 grid md:grid-cols-3 gap-8 border-t border-gray-100 pt-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About Doctor</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              {doctor.bio || "No biography available."}
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Availability</h3>
            {doctor.availability && Object.keys(doctor.availability).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(doctor.availability).map(([day, times]) => (
                  <div key={day} className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-bold text-gray-900 capitalize text-sm">{day}</p>
                    {Array.isArray(times) && times.length > 0 ? (
                      <p className="text-sm text-[#4CAF50] font-medium">{times.join(', ')}</p>
                    ) : (
                      <p className="text-sm text-gray-400">Not available</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Availability not specified.</p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Reviews</h2>
        <ReviewsList doctorId={doctor._id} />
      </div>
    </div>
  );
}

