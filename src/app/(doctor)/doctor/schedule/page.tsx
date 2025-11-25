'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type { Doctor } from '@/types';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export default function DoctorSchedulePage() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/doctors');
      const doctors = response.data || [];
      const doctorProfile = doctors.find((d: Doctor) => {
        const userId = typeof d.userId === 'object' ? (d.userId as any)?._id : d.userId;
        return userId === user?._id;
      }) || doctors[0];

      if (doctorProfile) {
        setDoctor(doctorProfile);
        setAvailability(doctorProfile.availability || {});
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load schedule.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleTimeSlot = (day: string, time: string) => {
    setAvailability((prev) => {
      const daySlots = prev[day] || [];
      const newSlots = daySlots.includes(time)
        ? daySlots.filter((slot) => slot !== time)
        : [...daySlots, time].sort();
      return { ...prev, [day]: newSlots };
    });
  };

  const handleSave = async () => {
    if (!doctor?._id) {
      toast.error('Doctor profile not found', { position: 'top-right' });
      return;
    }

    try {
      setSaving(true);
      setError('');

      await api.put(`/doctors/${doctor._id}`, {
        availability,
      });

      toast.success('Schedule updated successfully!', { position: 'top-right' });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to save schedule.');
        toast.error(err.response?.data?.message || 'Failed to save schedule!', { position: 'top-right' });
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your weekly availability and time slots</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold shadow-sm hover:shadow-md cursor-pointer text-sm sm:text-base"
          >
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
        <div className="space-y-6">
          {DAYS.map((day) => (
            <div key={day} className="border-b border-gray-200 pb-4 sm:pb-6 last:border-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{day}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
                {TIME_SLOTS.map((time) => {
                  const isSelected = availability[day]?.includes(time) || false;
                  return (
                    <button
                      key={time}
                      onClick={() => toggleTimeSlot(day, time)}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
