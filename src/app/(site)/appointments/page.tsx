'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import axios from 'axios';
import type { Appointment } from '@/types';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function MyAppointmentsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'patient') {
      router.push('/login?redirect=/appointments');
      return;
    }
    fetchAppointments();
  }, [isAuthenticated, user, router]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/bookings/my-appointments');
      setAppointments(response.data);
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

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      const date = new Date(apt.appointmentDate);
      return date > new Date() && apt.status !== 'cancelled' && apt.status !== 'completed';
    }
    if (filter === 'past') {
      const date = new Date(apt.appointmentDate);
      return date < new Date() || apt.status === 'completed';
    }
    return apt.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Appointments</h1>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'past'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Past
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'pending'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'confirmed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmed
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
              {error}
            </div>
          )}

          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => {
                const doctor = typeof appointment.doctorId === 'object' ? appointment.doctorId : null;
                const doctorUser = doctor && typeof doctor.userId === 'object' ? doctor.userId : null;
                const appointmentDate = new Date(appointment.appointmentDate);
                const isPast = appointmentDate < new Date();

                return (
                  <div
                    key={appointment._id}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {doctorUser?.name || 'Dr. Name'}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              appointment.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : appointment.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Specialization:</span> {doctor?.specialization || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>{' '}
                            {appointmentDate.toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span> {appointment.appointmentTime}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {appointment.appointmentType}
                          </div>
                        </div>
                        {appointment.symptoms && (
                          <div className="mt-4">
                            <span className="font-medium text-sm text-gray-700">Symptoms:</span>
                            <p className="text-sm text-gray-600 mt-1">{appointment.symptoms}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2 mt-4 md:mt-0 md:ml-4">
                        <Link
                          href={`/appointments/${appointment._id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
                        >
                          View Details
                        </Link>
                        {!isPast && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <>
                            <button
                              onClick={() => router.push(`/appointments/${appointment._id}?action=reschedule`)}
                              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => router.push(`/appointments/${appointment._id}?action=cancel`)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {appointment.status === 'completed' && (
                          <Link
                            href={`/appointments/${appointment._id}?action=review`}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-center"
                          >
                            Add Review
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' ? "You don't have any appointments yet." : `No ${filter} appointments found.`}
              </p>
              <Link
                href="/book-appointment"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold inline-block"
              >
                Book an Appointment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

