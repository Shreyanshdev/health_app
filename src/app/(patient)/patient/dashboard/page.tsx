'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type { Appointment, Doctor, User } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  CalendarCheck,
  Clock,
  FileText,
  Bell,
} from 'lucide-react';

export default function PatientDashboardPage() {
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    pastAppointments: 0,
    prescriptions: 0,
    notifications: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [appointmentsRes, prescriptionsRes, notificationsRes] = await Promise.all([
        api.get('/bookings/my-appointments').catch(() => ({ data: [] })),
        api.get('/prescriptions').catch(() => ({ data: [] })),
        api.get('/notifications').catch(() => ({ data: [] })),
      ]);

      const appointments: Appointment[] = appointmentsRes.data || [];
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const upcoming = appointments.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
      });

      const past = appointments.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate < now || apt.status === 'completed';
      });

      // Handle notifications response structure: { notifications: [], unreadCount: number }
      const notificationsData = notificationsRes.data?.notifications || notificationsRes.data || [];
      const notificationsArray = Array.isArray(notificationsData) ? notificationsData : [];
      const unreadNotifications = notificationsRes.data?.unreadCount ||
        notificationsArray.filter((n: any) => !n.read && !n.isRead).length;

      setStats({
        upcomingAppointments: upcoming.length,
        pastAppointments: past.length,
        prescriptions: Array.isArray(prescriptionsRes.data) ? prescriptionsRes.data.length : 0,
        notifications: unreadNotifications,
      });

      setUpcomingAppointments(upcoming.slice(0, 3));
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
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Patient Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Welcome back! Here's an overview of your health journey.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatCard
          title="Upcoming Appointments"
          value={stats.upcomingAppointments}
          icon={<CalendarCheck className="h-8 w-8" />}
          color="blue"
          href="/patient/appointments"
        />
        <StatCard
          title="Past Appointments"
          value={stats.pastAppointments}
          icon={<Clock className="h-8 w-8" />}
          color="green"
          href="/patient/appointments"
        />
        <StatCard
          title="Prescriptions"
          value={stats.prescriptions}
          icon={<FileText className="h-8 w-8" />}
          color="purple"
          href="/patient/prescriptions"
        />
        <StatCard
          title="Notifications"
          value={stats.notifications}
          icon={<Bell className="h-8 w-8" />}
          color="yellow"
          href="/patient/notifications"
        />
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
          <Link href="/patient/appointments" className="text-[#4CAF50] hover:text-[#1B3B36] text-sm font-bold transition cursor-pointer">
            View All →
          </Link>
        </div>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment._id} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Dr. {((appointment.doctorId as Doctor)?.userId as User)?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(appointment.appointmentDate), 'PPP')} at {appointment.appointmentTime}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(appointment.doctorId as Doctor)?.specialization || 'N/A'}
                    </p>
                  </div>
                    <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'confirmed'
                      ? 'bg-[#E8F5E9] text-[#4CAF50]'
                      : 'bg-[#FFF8E1] text-[#FFC107]'
                      }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
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
  color: 'blue' | 'green' | 'purple' | 'yellow';
  href?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-[#E8F5E9] text-[#4CAF50]',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-[#FFF8E1] text-[#FFC107]',
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

