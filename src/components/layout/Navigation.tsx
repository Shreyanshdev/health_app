'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { LogoutConfirmationModal } from '@/components/modals/LogoutConfirmationModal';

import { useScrollDirection } from '@/hooks/useScrollDirection';
import { Menu, X } from 'lucide-react';

export function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const scrollDirection = useScrollDirection();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <nav
      className={`bg-white sticky top-0 z-50 transition-transform duration-300 ${scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
        }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" aria-label="Health App Home">
            <span className="text-2xl font-bold text-gray-900">HealthApp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/doctors"
              className="text-gray-600 hover:text-gray-900 transition font-medium"
            >
              Doctors
            </Link>
            <Link
              href="/blog"
              className="text-gray-600 hover:text-gray-900 transition font-medium"
            >
              Blog
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-gray-900 transition font-medium"
            >
              About
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                href="/contact"
                className="text-gray-900 font-bold hover:text-gray-700 transition"
              >
                Contact Us
              </Link>
              <Link
                href="/book-appointment"
                className="bg-[#FFC107] text-gray-900 px-6 py-2.5 rounded-full font-bold hover:bg-[#FFD54F] transition shadow-sm"
              >
                Book Appointment
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                {user?.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="text-gray-600 hover:text-gray-900 transition font-medium"
                  >
                    Admin
                  </Link>
                )}
                <NotificationBell />
                <Link
                  href={
                    user?.role === 'patient'
                      ? '/patient/dashboard'
                      : user?.role === 'doctor'
                      ? '/doctor/dashboard'
                      : user?.role === 'admin'
                      ? '/admin/dashboard'
                      : '/profile'
                  }
                  className="text-gray-600 hover:text-gray-900 transition font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="text-red-600 hover:text-red-700 transition font-medium cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                <Link
                  href="/login"
                  className="text-gray-900 font-bold hover:underline"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white absolute left-0 right-0 px-4 shadow-lg">
            <div className="flex flex-col space-y-4">
              <Link
                href="/doctors"
                className="text-gray-600 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Doctors
              </Link>
              <Link
                href="/blog"
                className="text-gray-600 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
              <Link
                href="/book-appointment"
                className="bg-[#FFC107] text-gray-900 px-4 py-2 rounded-full font-bold text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Appointment
              </Link>

              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <p className="text-sm text-gray-500">Signed in as {user?.name}</p>
                  <Link
                    href={
                      user?.role === 'patient'
                        ? '/patient/dashboard'
                        : user?.role === 'doctor'
                        ? '/doctor/dashboard'
                        : user?.role === 'admin'
                        ? '/admin/dashboard'
                        : '/profile'
                    }
                    className="block text-gray-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button onClick={handleLogoutClick} className="text-red-600 font-medium w-full text-left cursor-pointer">Logout</button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200">
                  <Link href="/login" className="block text-gray-900 font-bold mb-2">Sign in</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </nav>
  );
}

