'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';


import api from '@/lib/api';

export default function SignupPage() {
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload: any = { name, email, password, role: activeTab };

      if (activeTab === 'doctor') {
        payload.specialization = specialization;
        payload.qualification = qualification;
      }

      const response = await api.post('/auth/register', payload);

      if (activeTab === 'doctor') {
        // Show success message for doctor
        setSuccessMessage('Registration request sent to admin for approval.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        // Auto login for patient
        const { user, accessToken } = response.data;
        await login({ accessToken, user });
        router.push('/patient/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Side - Image (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/auth_signup_side.png"
          alt="Healthcare Community"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-12 left-12 text-white max-w-lg">
          <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg text-gray-100">
            Create an account to start your journey towards better health management and care delivery.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white relative overflow-y-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center text-gray-600 hover:text-[#1B3B36] transition font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="w-full max-w-md mt-12 lg:mt-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join HealthApp as a Patient or Doctor</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button
              onClick={() => setActiveTab('patient')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'patient'
                ? 'bg-white text-[#1B3B36] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Patient
            </button>
            <button
              onClick={() => setActiveTab('doctor')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'doctor'
                ? 'bg-white text-[#1B3B36] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Doctor
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-[#E0F2F1] text-[#1B3B36] p-4 rounded-lg mb-6 text-sm border border-[#A5F3BC] flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent outline-none transition text-gray-900"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent outline-none transition text-gray-900"
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent outline-none transition text-gray-900"
                placeholder="Create a password"
                required
              />
            </div>

            {activeTab === 'doctor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent outline-none transition text-gray-900"
                    placeholder="e.g. Cardiologist"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent outline-none transition text-gray-900"
                    placeholder="e.g. MBBS, MD"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B3B36] text-white py-3 rounded-lg font-bold hover:bg-[#2E5C55] transition disabled:opacity-50 shadow-md"
            >
              {loading ? 'Creating Account...' : `Sign up as ${activeTab === 'patient' ? 'Patient' : 'Doctor'}`}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4CAF50] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
