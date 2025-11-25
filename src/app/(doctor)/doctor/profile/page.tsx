'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import type { User, Doctor } from '@/types';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ProfilePictureUpload } from '@/components/forms/ProfilePictureUpload';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { Edit2, User as UserIcon, Mail, Phone, Calendar, Briefcase, Award, CheckCircle } from 'lucide-react';

export default function DoctorProfilePage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
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
      fetchDoctorProfile();
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

  const fetchDoctorProfile = async () => {
    try {
      const response = await api.get('/doctors');
      if (response.data && response.data.length > 0) {
        const doctor = response.data.find((d: Doctor) => (d.userId as any)?._id === user?._id) || response.data[0];
        setDoctorProfile(doctor);
      }
    } catch (err) {
      console.error('Failed to load doctor profile:', err);
    }
  };

  const handleProfilePictureUpdate = (newPictureUrl: string) => {
    if (profile) {
      setProfile({ ...profile, profilePicture: newPictureUrl });
    }
  };

  const handleProfileUpdate = () => {
    fetchProfile();
    fetchDoctorProfile();
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
        <p>{error}</p>
        <button onClick={fetchProfile} className="mt-2 text-blue-600 hover:text-blue-700 hover:underline cursor-pointer font-bold transition">
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
          <p className="text-sm sm:text-base text-gray-600">Manage your professional information and profile</p>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-sm hover:shadow-md cursor-pointer text-sm sm:text-base"
        >
          <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Edit Details</span>
          <span className="sm:hidden">Edit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Details Card */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Account Details</h2>
            </div>
            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-start gap-3 sm:gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Full Name</p>
                  <p className="text-base sm:text-lg text-gray-900 font-semibold truncate">{profile.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Email Address</p>
                  <p className="text-base sm:text-lg text-gray-900 font-semibold truncate">{profile.email}</p>
                </div>
              </div>

              {profile.phone && (
                <div className="flex items-start gap-3 sm:gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                    <p className="text-base sm:text-lg text-gray-900 font-semibold">{profile.phone}</p>
                  </div>
                </div>
              )}

              {doctorProfile && (
                <>
                  <div className="flex items-start gap-3 sm:gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Specialization</p>
                      <p className="text-base sm:text-lg text-gray-900 font-semibold">{doctorProfile.specialization}</p>
                    </div>
                  </div>

                  {doctorProfile.qualification && (
                    <div className="flex items-start gap-3 sm:gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Qualification</p>
                        <p className="text-base sm:text-lg text-gray-900 font-semibold">{doctorProfile.qualification}</p>
                      </div>
                    </div>
                  )}

                  {doctorProfile.experience && (
                    <div className="flex items-start gap-3 sm:gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Experience</p>
                        <p className="text-base sm:text-lg text-gray-900 font-semibold">{doctorProfile.experience} years</p>
                      </div>
                    </div>
                  )}

                  {doctorProfile.status && (
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Status</p>
                        <p className={`text-base sm:text-lg font-semibold capitalize ${
                          doctorProfile.status === 'approved' 
                            ? 'text-green-600' 
                            : doctorProfile.status === 'pending' 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                        }`}>
                          {doctorProfile.status}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Picture Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Profile Picture</h2>
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
