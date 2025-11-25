'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogoutConfirmationModal } from '@/components/modals/LogoutConfirmationModal';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  Settings,
  LogOut,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react';

interface AdminSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ onCollapseChange, mobileOpen = false, onMobileClose }: AdminSidebarProps) {
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

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Doctors', href: '/admin/doctors', icon: Users },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Appointments', href: '/admin/appointments', icon: CalendarCheck },
    { name: 'Blogs', href: '/admin/blogs', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
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
          <Link href="/admin/dashboard" className="flex items-center space-x-2 text-lg font-bold text-gray-900 hover:text-purple-600 transition cursor-pointer">
            <HeartPulse className="h-6 w-6 text-purple-600" />
            <span>Admin Panel</span>
          </Link>
        )}
        {isCollapsed && (
          <div className="flex items-center justify-center w-full">
            <HeartPulse className="h-6 w-6 text-purple-600" />
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
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive(item.href)
                  ? 'bg-purple-600 text-white shadow-sm'
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
      <div className="px-3 py-4 border-t border-gray-200 space-y-2">
        <Link
          href="/"
          onClick={onMobileClose}
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Back to Site' : undefined}
        >
          <Home className="h-5 w-5 flex-shrink-0" aria-hidden={true} />
          {!isCollapsed && <span>Back to Site</span>}
        </Link>
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
