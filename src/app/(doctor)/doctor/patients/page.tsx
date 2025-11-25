'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type { Appointment, User } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Array<{
    patient: User;
    appointmentCount: number;
    lastAppointment?: Appointment;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/bookings/doctor-appointments');
      const appointments: Appointment[] = response.data || [];

      // Group appointments by patient
      const patientMap = new Map<string, {
        patient: User;
        appointments: Appointment[];
      }>();

      appointments.forEach((apt) => {
        const patientId = typeof apt.patientId === 'string' ? apt.patientId : (apt.patientId as User)?._id;
        if (!patientId) return;

        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            patient: apt.patientId as User,
            appointments: [],
          });
        }
        patientMap.get(patientId)!.appointments.push(apt);
      });

      const patientsList = Array.from(patientMap.values()).map((item) => ({
        patient: item.patient,
        appointmentCount: item.appointments.length,
        lastAppointment: item.appointments.sort(
          (a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
        )[0],
      }));

      setPatients(patientsList);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load patients.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
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
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Patients</h1>
        <p className="text-sm sm:text-base text-gray-600">View and manage all your patients</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
        {patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Phone
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointments
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Last Appointment
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((item) => (
                  <tr key={item.patient._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.patient.name}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.patient.email}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {item.patient.phone || 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                        {item.appointmentCount}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {item.lastAppointment
                        ? format(new Date(item.lastAppointment.appointmentDate), 'PPP')
                        : 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/doctor/patients/${item.patient._id}`}
                        className="text-blue-600 hover:text-blue-700 font-bold transition cursor-pointer"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No patients found</p>
        )}
      </div>
    </div>
  );
}
