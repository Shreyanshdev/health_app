'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { LogoutConfirmationModal } from '@/components/modals/LogoutConfirmationModal';

interface DoctorHeaderProps {
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

export function DoctorHeader({ mobileMenuOpen = false, onMobileMenuToggle }: DoctorHeaderProps) {
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
          Welcome, <span className="text-blue-600">Dr. {user?.name || 'Doctor'}</span>!
        </h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
        <span className="hidden xl:inline-block text-gray-600 text-sm font-medium px-3 py-1 bg-gray-50 rounded-full">
          {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Doctor'}
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
