'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import type { User } from '@/types';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ProfilePictureUpload } from '@/components/forms/ProfilePictureUpload';
import { MedicalHistoryForm } from '@/components/forms/MedicalHistoryForm';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { Edit2, User as UserIcon, Mail, Phone, MapPin, Calendar, Users } from 'lucide-react';

export default function PatientProfilePage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await api.get('/profile');
      setProfile(response.data);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to load profile.');
      toast.error(axiosError.response?.data?.message || 'Failed to load profile!', { position: 'top-right' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleProfilePictureUpdate = (newPictureUrl: string) => {
    if (profile) {
      setProfile({ ...profile, profilePicture: newPictureUrl });
    }
  };

  const handleProfileUpdate = () => {
    fetchProfile();
  };

  // Calculate age from dateOfBirth
  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1B3B36]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
        <p>{error}</p>
        <button onClick={fetchProfile} className="mt-2 text-[#4CAF50] hover:text-[#1B3B36] hover:underline cursor-pointer font-bold transition">
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-4 text-gray-600">
        <p>No profile data found. Please ensure you are logged in.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and medical history</p>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#1B3B36] text-white rounded-lg hover:bg-[#2E5C55] transition font-semibold shadow-sm hover:shadow-md cursor-pointer"
        >
          <Edit2 className="w-5 h-5" />
          Edit Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Details Card */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Account Details</h2>
            </div>
            <div className="space-y-5">
              <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 bg-[#E8F5E9] rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-[#4CAF50]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
                  <p className="text-lg text-gray-900 font-semibold">{profile.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 bg-[#E3F2FD] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                  <p className="text-lg text-gray-900 font-semibold">{profile.email}</p>
                </div>
              </div>

              {profile.phone && (
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 bg-[#FFF8E1] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#FFC107]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                    <p className="text-lg text-gray-900 font-semibold">{profile.phone}</p>
                  </div>
                </div>
              )}

              {profile.dateOfBirth && (
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 bg-[#F3E5F5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Date of Birth</p>
                    <p className="text-lg text-gray-900 font-semibold">
                      {formatDate(profile.dateOfBirth)} {calculateAge(profile.dateOfBirth) && `(${calculateAge(profile.dateOfBirth)} years)`}
                    </p>
                  </div>
                </div>
              )}

              {profile.gender && (
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 bg-[#FFEBEE] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Gender</p>
                    <p className="text-lg text-gray-900 font-semibold capitalize">{profile.gender}</p>
                  </div>
                </div>
              )}

              {profile.address && (
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 bg-[#E0F2F1] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#1B3B36]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Address</p>
                    <p className="text-lg text-gray-900 font-semibold">{profile.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Role</p>
                  <p className="text-lg text-gray-900 font-semibold capitalize">{profile.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical History Card */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Medical History</h2>
            <MedicalHistoryForm />
          </div>
        </div>

        {/* Profile Picture Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Picture</h2>
            <ProfilePictureUpload
              currentPicture={profile.profilePicture}
              onUploadSuccess={handleProfilePictureUpdate}
            />
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSuccess={handleProfileUpdate}
      />
    </div>
  );
}

