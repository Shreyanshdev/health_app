'use client';

import { X, LogOut } from 'lucide-react';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmationModal({ isOpen, onClose, onConfirm }: LogoutConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition cursor-pointer rounded-lg hover:bg-gray-100"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-red-100 p-3">
            <LogOut className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Confirm Logout
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Are you sure you want to logout? You'll need to sign in again to access your account.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 bg-transparent rounded-lg hover:bg-gray-50 hover:border-gray-400 transition font-semibold text-sm sm:text-base cursor-pointer"
          >
            Stay Signed In
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm sm:text-base shadow-sm hover:shadow-md cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

