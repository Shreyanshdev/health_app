'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, CalendarPlus, Menu, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { LogoutConfirmationModal } from '@/components/modals/LogoutConfirmationModal';

interface PatientHeaderProps {
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

export function PatientHeader({ mobileMenuOpen = false, onMobileMenuToggle }: PatientHeaderProps) {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    toast.info('Logged out successfully', { position: 'top-right' });
  };

  return (
    <header className="bg-white sticky top-0 z-40 shadow-md border-b border-gray-200 h-14 md:h-16 flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
        {/* Mobile Menu Button */}
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition cursor-pointer flex-shrink-0"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
        <h1 className="hidden sm:block text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
          Welcome, <span className="text-[#1B3B36]">{user?.name || 'Patient'}</span>!
        </h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
        <Link
          href="/book-appointment"
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-2.5 bg-[#FFC107] text-gray-900 rounded-full font-bold text-xs sm:text-sm md:text-base hover:bg-[#FFD54F] transition shadow-sm hover:shadow-md cursor-pointer"
        >
          <CalendarPlus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Book Appointment</span>
          <span className="sm:hidden">Book</span>
        </Link>
        <span className="hidden xl:inline-block text-gray-600 text-sm font-medium px-3 py-1 bg-gray-50 rounded-full">
          {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Patient'}
        </span>
        <button
          onClick={handleLogoutClick}
          className="text-red-600 hover:text-red-700 transition font-medium text-xs sm:text-sm md:text-base px-1 sm:px-2 md:px-3 cursor-pointer"
        >
          <span className="hidden sm:inline">Logout</span>
          <LogOut className="h-4 w-4 sm:hidden" />
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </header>
  );
}

