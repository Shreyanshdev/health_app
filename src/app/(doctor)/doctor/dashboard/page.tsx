'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type { Appointment, User, Prescription } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  CalendarCheck,
  Clock,
  TrendingUp,
} from 'lucide-react';

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canCreatePrescription = (appointment: Appointment) => {
    const prescriptionId = appointment.prescriptionId
      ? (typeof appointment.prescriptionId === 'object' && appointment.prescriptionId !== null
        ? (appointment.prescriptionId as Prescription)._id
        : appointment.prescriptionId)
      : null;
    return (appointment.status === 'completed' || appointment.status === 'confirmed') && !prescriptionId;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [appointmentsRes] = await Promise.all([
        api.get('/bookings/doctor-appointments'),
      ]);

      const appointments: Appointment[] = appointmentsRes.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayApps = appointments.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime() && apt.status !== 'cancelled';
      });

      const upcomingApps = appointments.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= today && apt.status !== 'cancelled' && apt.status !== 'completed';
      });

      const completedApps = appointments.filter((apt) => apt.status === 'completed');

      // Get unique patients
      const uniquePatients = new Set(
        appointments.map((apt) => (apt.patientId as User)?._id || apt.patientId)
      );

      setStats({
        totalPatients: uniquePatients.size,
        todayAppointments: todayApps.length,
        upcomingAppointments: upcomingApps.length,
        completedAppointments: completedApps.length,
      });

      setTodayAppointments(todayApps.slice(0, 5));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
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
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Welcome back! Here's an overview of your practice.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={<Users className="h-8 w-8" />}
          color="blue"
          href="/doctor/patients"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={<CalendarCheck className="h-8 w-8" />}
          color="green"
          href="/doctor/appointments"
        />
        <StatCard
          title="Upcoming"
          value={stats.upcomingAppointments}
          icon={<Clock className="h-8 w-8" />}
          color="purple"
          href="/doctor/appointments"
        />
        <StatCard
          title="Completed"
          value={stats.completedAppointments}
          icon={<TrendingUp className="h-8 w-8" />}
          color="orange"
          href="/doctor/appointments"
        />
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Today's Appointments</h2>
          <Link href="/doctor/appointments" className="text-blue-600 hover:text-blue-700 text-sm font-bold transition cursor-pointer">
            View All →
          </Link>
        </div>
        {todayAppointments.length > 0 ? (
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <div key={appointment._id} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {appointment.patientName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(appointment.appointmentDate), 'PPP')} at {appointment.appointmentTime}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {appointment.appointmentType === 'online' ? 'Online Consultation' : 'In-Clinic Visit'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end gap-2">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.status === 'confirmed'
                          ? 'bg-[#E8F5E9] text-[#4CAF50]'
                          : appointment.status === 'pending'
                          ? 'bg-[#FFF8E1] text-[#FFC107]'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {appointment.status}
                    </span>
                    {canCreatePrescription(appointment) && (
                      <button
                        onClick={() => router.push(`/doctor/appointments/${appointment._id}`)}
                        className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition"
                      >
                        Create Prescription
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/doctor/appointments/${appointment._id}`)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  href,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  href?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-[#E8F5E9] text-[#4CAF50]',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  const CardContent = (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses[color]} rounded-xl p-3 sm:p-4 flex-shrink-0`}>{icon}</div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
