'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import axios from 'axios';
import type { User, MedicalHistory, Doctor } from '@/types';
import { ProfilePictureUpload } from '@/components/forms/ProfilePictureUpload';
import { MedicalHistoryForm } from '@/components/forms/MedicalHistoryForm';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other' | '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      setUser(response.data);
      
      if (response.data.medicalHistory) {
        setMedicalHistory(response.data.medicalHistory);
      }
      if (response.data.doctorProfile) {
        setDoctorProfile(response.data.doctorProfile);
      }

      // Set form data
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        dateOfBirth: response.data.dateOfBirth ? new Date(response.data.dateOfBirth).toISOString().split('T')[0] : '',
        gender: response.data.gender || '',
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put('/profile', formData);
      setUser(response.data);
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to update profile.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isPatient = user.role === 'patient';
  const isDoctor = user.role === 'doctor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

          {/* Profile Picture Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profile Picture</h2>
            <ProfilePictureUpload
              currentPicture={user.profilePicture}
              onUploadSuccess={(url) => {
                if (user) {
                  setUser({ ...user, profilePicture: url });
                }
              }}
            />
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as typeof formData.gender })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      fetchProfile();
                    }}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="text-lg font-medium text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="text-lg font-medium text-gray-900">{user.email}</p>
                  </div>
                  {user.phone && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="text-lg font-medium text-gray-900">{user.phone}</p>
                    </div>
                  )}
                  {user.address && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="text-lg font-medium text-gray-900">{user.address}</p>
                    </div>
                  )}
                  {user.dateOfBirth && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                      <p className="text-lg font-medium text-gray-900">
                        {new Date(user.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {user.gender && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Gender</p>
                      <p className="text-lg font-medium text-gray-900 capitalize">{user.gender}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Medical History (Patient only) */}
          {isPatient && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Medical History</h2>
              <MedicalHistoryForm
                initialData={medicalHistory}
                onSuccess={() => {
                  fetchProfile();
                }}
              />
            </div>
          )}

          {/* Doctor Profile Info */}
          {isDoctor && doctorProfile && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Doctor Profile</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Specialization</p>
                  <p className="text-lg font-medium text-gray-900">{doctorProfile.specialization}</p>
                </div>
                {doctorProfile.qualification && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Qualification</p>
                    <p className="text-lg font-medium text-gray-900">{doctorProfile.qualification}</p>
                  </div>
                )}
                {doctorProfile.experience && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Experience</p>
                    <p className="text-lg font-medium text-gray-900">{doctorProfile.experience} years</p>
                  </div>
                )}
                {doctorProfile.consultationFee && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Consultation Fee</p>
                    <p className="text-lg font-medium text-gray-900">₹{doctorProfile.consultationFee}</p>
                  </div>
                )}
                {doctorProfile.rating && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rating</p>
                    <p className="text-lg font-medium text-gray-900">
                      {doctorProfile.rating}/5 ({doctorProfile.totalReviews || 0} reviews)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

