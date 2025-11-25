'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type { Notification } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function PatientNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/notifications');
      // API returns { notifications: [], unreadCount: number }
      const notificationsData = response.data?.notifications || response.data || [];
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load notifications.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        Array.isArray(prev)
          ? prev.map((n) => (n._id === id ? { ...n, read: true, isRead: true } : n))
          : []
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) =>
        Array.isArray(prev)
          ? prev.map((n) => ({ ...n, read: true, isRead: true }))
          : []
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.filter((n) => n._id !== id) : []
      );
      toast.success('Notification deleted successfully', { position: 'top-right' });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to delete notification.', { position: 'top-right' });
      } else {
        toast.error('An unexpected error occurred.', { position: 'top-right' });
      }
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

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.isRead).length
    : 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your health information</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-[#1B3B36] text-white rounded-lg hover:bg-[#2E5C55] transition text-sm font-semibold shadow-sm hover:shadow-md cursor-pointer"
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border transition ${(notification.isRead)
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-[#E8F5E9] border-[#4CAF50]'
                  }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${(notification.isRead) ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(notification.createdAt || ''), 'PPP p')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-xs text-[#4CAF50] hover:text-[#1B3B36] font-bold transition cursor-pointer whitespace-nowrap"
                      >
                        Mark as read
                      </button>
                    )}
                    {notification.link && (
                      <Link
                        href={notification.link}
                        className="text-xs text-[#4CAF50] hover:text-[#1B3B36] font-bold transition cursor-pointer whitespace-nowrap"
                      >
                        View →
                      </Link>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-1.5 sm:p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition cursor-pointer"
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No notifications found</p>
        )}
      </div>
    </div>
  );
}

