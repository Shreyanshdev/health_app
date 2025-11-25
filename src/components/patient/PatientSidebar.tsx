'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  FileText,
  UserCircle,
  Settings,
  LogOut,
  HeartPulse,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { LogoutConfirmationModal } from '@/components/modals/LogoutConfirmationModal';

interface PatientSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function PatientSidebar({ onCollapseChange, mobileOpen = false, onMobileClose }: PatientSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Find Doctors', href: '/patient/find-doctors', icon: Search },
    { name: 'My Appointments', href: '/patient/appointments', icon: CalendarCheck },
    { name: 'Prescriptions', href: '/patient/prescriptions', icon: FileText },
    { name: 'Notifications', href: '/patient/notifications', icon: Bell },
    { name: 'Profile', href: '/patient/profile', icon: UserCircle },
    { name: 'Settings', href: '/patient/settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    toast.info('Logged out successfully', { position: 'top-right' });
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ease-in-out z-40 ${isCollapsed ? 'w-20' : 'w-64'} md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex items-center justify-between h-14 md:h-16 bg-white border-b border-gray-200 px-3">
        {!isCollapsed && (
          <Link href="/patient/dashboard" className="flex items-center space-x-2 text-lg font-bold text-gray-900 hover:text-[#1B3B36] transition cursor-pointer">
            <HeartPulse className="h-6 w-6 text-[#FFC107]" />
            <span>Patient Panel</span>
          </Link>
        )}
        {isCollapsed && (
          <div className="flex items-center justify-center w-full">
            <HeartPulse className="h-6 w-6 text-[#FFC107]" />
          </div>
        )}
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-600"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive(item.href)
                  ? 'bg-[#FFC107] text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${isCollapsed ? 'justify-center' : ''}`}
              aria-current={isActive(item.href) ? 'page' : undefined}
              title={isCollapsed ? item.name : undefined}
            >
              <IconComponent className="h-5 w-5 flex-shrink-0" aria-hidden={true} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-200">
        <button
          onClick={handleLogoutClick}
          className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" aria-hidden={true} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}

