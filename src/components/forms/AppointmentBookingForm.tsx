'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '@/lib/api';
import type { Doctor } from '@/types';

function AppointmentBookingFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDoctorId = searchParams.get('doctorId');

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [formData, setFormData] = useState({
    doctorId: selectedDoctorId || '',
    patientId: '',
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'online' as 'online' | 'in-clinic',
    symptoms: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication first
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        // Not authenticated - redirect to login
        const redirectUrl = `/login?redirect=${encodeURIComponent('/book-appointment' + (selectedDoctorId ? `?doctorId=${selectedDoctorId}` : ''))}`;
        router.push(redirectUrl);
        return;
      }

      try {
        const user = JSON.parse(userStr);
        
        // Check if user is a patient
        if (user.role !== 'patient') {
          toast.error('Only patients can book appointments. Please login with a patient account.');
          router.push('/login?redirect=/book-appointment');
          return;
        }
        
        setIsAuthenticated(true);
        setFormData(prev => ({
          ...prev,
          patientId: user._id,
          patientName: user.name || '',
          patientEmail: user.email || '',
        }));
        fetchDoctors();
      } catch (err) {
        console.error('Error parsing user:', err);
        router.push('/login?redirect=/book-appointment');
      }
    }
  }, [router, selectedDoctorId]);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      toast.error('Failed to load doctors. Please refresh the page.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    // Check if exactly 10 digits
    return digitsOnly.length === 10;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits, spaces, hyphens, and parentheses
    const cleaned = value.replace(/[^\d\s\-()]/g, '');
    setFormData({ ...formData, patientPhone: cleaned });
    
    // Clear error when user starts typing
    if (errors.patientPhone) {
      setErrors({ ...errors, patientPhone: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.doctorId) {
      newErrors.doctorId = 'Please select a doctor';
    }

    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Name is required';
    }

    if (!formData.patientEmail.trim()) {
      newErrors.patientEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patientEmail)) {
      newErrors.patientEmail = 'Please enter a valid email address';
    }

    if (!formData.patientPhone.trim()) {
      newErrors.patientPhone = 'Phone number is required';
    } else if (!validatePhone(formData.patientPhone)) {
      newErrors.patientPhone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Please select an appointment date';
    }

    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Please select an appointment time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Check authentication again before submitting
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Session expired. Please login again.');
        router.push('/login?redirect=/book-appointment');
        return;
      }
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Format phone number (remove non-digits, ensure 10 digits)
      const cleanedPhone = formData.patientPhone.replace(/\D/g, '');
      if (cleanedPhone.length !== 10) {
        toast.error('Phone number must be exactly 10 digits');
        setLoading(false);
        return;
      }

      // Format the appointment data
      const appointmentData: Record<string, unknown> = {
        doctorId: formData.doctorId,
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: cleanedPhone,
        appointmentDate: new Date(`${formData.appointmentDate}T${formData.appointmentTime}`).toISOString(),
        appointmentTime: formData.appointmentTime,
        appointmentType: formData.appointmentType,
      };

      // Only include symptoms if provided
      if (formData.symptoms && formData.symptoms.trim() !== '') {
        appointmentData.symptoms = formData.symptoms;
      }

      const response = await api.post('/bookings', appointmentData);
      
      // Show success toast
      toast.success('🎉 Appointment booked successfully! You will receive a confirmation email shortly.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to book appointment. Please try again.';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading if checking authentication
  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  const selectedDoctor = doctors.find(d => d._id === formData.doctorId);
  const doctorUser = selectedDoctor && typeof selectedDoctor.userId === 'object' ? selectedDoctor.userId : null;

  return (
    <>
      <ToastContainer />
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="grid lg:grid-cols-2 w-full min-h-[600px]">
          {/* Left Side - Visual/Info */}
          <div className="bg-gradient-to-br from-[#1B3B36] via-[#2E5C55] to-[#1B3B36] p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#4CAF50] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFC107] rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Your Health Journey Starts Here
                </h2>
                <p className="text-gray-200 text-lg leading-relaxed">
                  Schedule your consultation with our expert healthcare professionals. We&apos;re here to help you on your health journey.
                </p>
              </div>

              {/* Doctor Info Card */}
              {selectedDoctor && doctorUser && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 mb-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#1B3B36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{doctorUser.name}</h3>
                      <p className="text-gray-200">{selectedDoctor.specialization}</p>
                    </div>
                  </div>
                  {selectedDoctor.qualification && (
                    <p className="text-gray-200 text-sm">{selectedDoctor.qualification}</p>
                  )}
                </div>
              )}

              {/* Features List */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-8 h-8 bg-[#4CAF50]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#A5F3BC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-200">Instant confirmation</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-8 h-8 bg-[#4CAF50]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#A5F3BC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-200">Email reminders</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-8 h-8 bg-[#4CAF50]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#A5F3BC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-200">Calendar sync</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 lg:p-12 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Doctor Selection */}
              <div>
                <label htmlFor="doctorId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Doctor <span className="text-red-500">*</span>
                </label>
                {loadingDoctors ? (
                  <div className="animate-pulse bg-gray-200 h-12 rounded-xl"></div>
                ) : (
                  <select
                    id="doctorId"
                    required
                    value={formData.doctorId}
                    onChange={(e) => {
                      setFormData({ ...formData, doctorId: e.target.value });
                      if (errors.doctorId) setErrors({ ...errors, doctorId: '' });
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition text-gray-900 ${
                      errors.doctorId ? 'border-red-300' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map((doctor) => {
                      const user = typeof doctor.userId === 'object' ? doctor.userId : null;
                      return (
                        <option key={doctor._id} value={doctor._id}>
                          {user?.name || 'Dr. Name'} - {doctor.specialization}
                        </option>
                      );
                    })}
                  </select>
                )}
                {errors.doctorId && (
                  <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>
                )}
              </div>

              {/* Patient Name */}
              <div>
                <label htmlFor="patientName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="patientName"
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={(e) => {
                    setFormData({ ...formData, patientName: e.target.value });
                    if (errors.patientName) setErrors({ ...errors, patientName: '' });
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition text-gray-900 ${
                    errors.patientName ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="John Doe"
                />
                {errors.patientName && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientName}</p>
                )}
              </div>

              {/* Patient Email */}
              <div>
                <label htmlFor="patientEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="patientEmail"
                  type="email"
                  required
                  value={formData.patientEmail}
                  onChange={(e) => {
                    setFormData({ ...formData, patientEmail: e.target.value });
                    if (errors.patientEmail) setErrors({ ...errors, patientEmail: '' });
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition text-gray-900 ${
                    errors.patientEmail ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.patientEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientEmail}</p>
                )}
              </div>

              {/* Patient Phone */}
              <div>
                <label htmlFor="patientPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">(10 digits)</span>
                </label>
                <input
                  id="patientPhone"
                  type="tel"
                  required
                  value={formData.patientPhone}
                  onChange={handlePhoneChange}
                  maxLength={14}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition text-gray-900 ${
                    errors.patientPhone ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="1234567890"
                />
                {errors.patientPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientPhone}</p>
                )}
                {formData.patientPhone && !errors.patientPhone && (
                  <p className="mt-1 text-xs text-green-600">
                    {formData.patientPhone.replace(/\D/g, '').length}/10 digits
                  </p>
                )}
              </div>

              {/* Date and Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="appointmentDate" className="block text-sm font-semibold text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="appointmentDate"
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => {
                      setFormData({ ...formData, appointmentDate: e.target.value });
                      if (errors.appointmentDate) setErrors({ ...errors, appointmentDate: '' });
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition text-gray-900 ${
                      errors.appointmentDate ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.appointmentDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.appointmentDate}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="appointmentTime" className="block text-sm font-semibold text-gray-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="appointmentTime"
                    type="time"
                    required
                    value={formData.appointmentTime}
                    onChange={(e) => {
                      setFormData({ ...formData, appointmentTime: e.target.value });
                      if (errors.appointmentTime) setErrors({ ...errors, appointmentTime: '' });
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition text-gray-900 ${
                      errors.appointmentTime ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.appointmentTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.appointmentTime}</p>
                  )}
                </div>
              </div>

              {/* Appointment Type */}
              <div>
                <label htmlFor="appointmentType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, appointmentType: 'online' })}
                    className={`px-4 py-3 rounded-xl border-2 transition cursor-pointer ${
                      formData.appointmentType === 'online'
                        ? 'border-[#4CAF50] bg-[#E8F5E9] text-[#1B3B36]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Online</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, appointmentType: 'in-clinic' })}
                    className={`px-4 py-3 rounded-xl border-2 transition cursor-pointer ${
                      formData.appointmentType === 'in-clinic'
                        ? 'border-[#4CAF50] bg-[#E8F5E9] text-[#1B3B36]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium">In-Clinic</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label htmlFor="symptoms" className="block text-sm font-semibold text-gray-700 mb-2">
                  Symptoms / Reason for Visit
                </label>
                <textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition resize-none text-gray-900"
                  placeholder="Describe your symptoms or reason for the appointment..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#1B3B36] to-[#2E5C55] text-white py-4 rounded-xl font-semibold text-lg hover:from-[#2E5C55] hover:to-[#1B3B36] transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Booking Appointment...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export function AppointmentBookingForm() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <AppointmentBookingFormContent />
    </Suspense>
  );
}
