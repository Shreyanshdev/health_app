'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  CalendarCheck,
  Users,
  FileText,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

interface DashboardStats {
  totalAppointments: number;
  totalDoctors: number;
  totalBlogs: number;
  totalUsers: number;
  pendingDoctorRequests: number;
  recentAppointments: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    totalDoctors: 0,
    totalBlogs: 0,
    totalUsers: 0,
    pendingDoctorRequests: 0,
    recentAppointments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [appointmentsRes, doctorsRes, blogsRes, pendingDoctorsRes, usersStatsRes] = await Promise.all([
        api.get('/bookings').catch(() => ({ data: [] })),
        api.get('/doctors').catch(() => ({ data: [] })),
        api.get('/blogs').catch(() => ({ data: [] })),
        api.get('/auth/pending-doctors').catch(() => ({ data: [] })),
        api.get('/users/stats').catch(() => ({ data: { totalUsers: 0 } })),
      ]);

      const appointments = appointmentsRes.data || [];
      const doctors = doctorsRes.data || [];
      const blogs = blogsRes.data || [];
      const pendingDoctors = pendingDoctorsRes.data || [];
      const userStats = usersStatsRes.data || { totalUsers: 0 };

      setStats({
        totalAppointments: appointments.length,
        totalDoctors: doctors.length,
        totalBlogs: blogs.length,
        totalUsers: userStats.totalUsers || 0,
        pendingDoctorRequests: pendingDoctors.length,
        recentAppointments: appointments.slice(0, 5),
      });
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-sm sm:text-base text-gray-600">Welcome back! Here's an overview of your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments}
          icon={<CalendarCheck className="h-8 w-8" />}
          color="blue"
          href="/admin/appointments"
        />
        <StatCard
          title="Total Doctors"
          value={stats.totalDoctors}
          icon={<Users className="h-8 w-8" />}
          color="green"
          href="/admin/doctors"
        />
        <StatCard
          title="Total Blogs"
          value={stats.totalBlogs}
          icon={<FileText className="h-8 w-8" />}
          color="purple"
          href="/admin/blogs"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<UserCheck className="h-8 w-8" />}
          color="orange"
          href="/admin/users"
        />
      </div>

      {/* Pending Doctor Requests Alert */}
      {stats.pendingDoctorRequests > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-yellow-900 mb-1 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {stats.pendingDoctorRequests} Pending Doctor Request{stats.pendingDoctorRequests > 1 ? 's' : ''}
              </h3>
              <p className="text-sm sm:text-base text-yellow-700">Review and approve doctor registration requests</p>
            </div>
            <Link
              href="/admin/doctors"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold shadow-sm hover:shadow-md cursor-pointer text-sm sm:text-base whitespace-nowrap"
            >
              Review Requests
            </Link>
          </div>
        </div>
      )}

      {/* Recent Appointments */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Appointments</h2>
          <Link href="/admin/appointments" className="text-purple-600 hover:text-purple-700 text-sm font-bold transition cursor-pointer">
            View All →
          </Link>
        </div>
        {stats.recentAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Doctor
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentAppointments.map((appointment: any, index: number) => (
                  <tr key={appointment._id || index} className="hover:bg-gray-50 transition">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {appointment.patientName || 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {appointment.doctorId?.specialization || 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.appointmentDate
                        ? format(new Date(appointment.appointmentDate), 'PPP')
                        : 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.status === 'confirmed'
                            ? 'bg-[#E8F5E9] text-[#4CAF50]'
                            : appointment.status === 'pending'
                            ? 'bg-[#FFF8E1] text-[#FFC107]'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {appointment.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No recent appointments</p>
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
