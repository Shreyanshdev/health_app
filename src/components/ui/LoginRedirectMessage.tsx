'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginRedirectMessageContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  if (!redirect) return null;

  return (
    <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
      <p className="font-medium">
        Please login to continue booking your appointment.
      </p>
    </div>
  );
}

export function LoginRedirectMessage() {
  return (
    <Suspense fallback={null}>
      <LoginRedirectMessageContent />
    </Suspense>
  );
}

