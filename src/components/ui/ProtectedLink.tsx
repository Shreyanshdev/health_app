'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function ProtectedLink({ href, children, className }: ProtectedLinkProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Not logged in - redirect to login with redirect URL
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
    } else {
      // Logged in - navigate normally
      router.push(href);
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

