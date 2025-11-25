'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function BookAppointmentButton() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleClick = () => {
    if (!isAuthenticated) {
      // Not logged in - redirect to login with redirect URL
      router.push('/login?redirect=/book-appointment');
    } else {
      // Logged in - go to booking page
      router.push('/book-appointment');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
    >
      Book Appointment
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </button>
  );
}

