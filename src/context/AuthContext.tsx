'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { accessToken: string; user: User }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (credentials: { accessToken: string; user: User }) => {
    setUser(credentials.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(credentials.user));
      localStorage.setItem('accessToken', credentials.accessToken);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      // Even if API call fails, clear local storage
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

