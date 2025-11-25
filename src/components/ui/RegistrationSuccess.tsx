'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const role = searchParams.get('role');

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShow(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setShow(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!show) return null;

  if (role === 'doctor') {
    return (
      <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">
              Doctor registration request submitted successfully!
            </p>
            <p className="text-xs">
              Your registration is pending admin approval. You will receive an email notification once your account is approved.
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="ml-auto text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium">
          Registration successful! Please login to continue.
        </p>
        <button
          onClick={() => setShow(false)}
          className="ml-auto text-green-600 hover:text-green-800"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function RegistrationSuccess() {
  return (
    <Suspense fallback={null}>
      <RegistrationSuccessContent />
    </Suspense>
  );
}

