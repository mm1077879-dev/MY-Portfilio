import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import type { AdminUser } from '../types/portfolio';

interface AuthContextValue {
  admin: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<AdminUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshAdmin = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/auth/session');
      const sessionAdmin = res.data?.data?.admin || null;
      setAdmin(sessionAdmin);
      return sessionAdmin;
    } catch (error) {
      setAdmin(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAdmin().catch((error: unknown) => {
      console.error('Unable to verify administrator session.', error);
    });
  }, [refreshAdmin]);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const loggedInAdmin = res.data?.data?.admin;
    if (!loggedInAdmin) {
      throw new Error('Authentication response did not include an administrator session.');
    }
    setAdmin(loggedInAdmin);
  };

  const logout = async () => {
    await apiClient.post('/auth/logout');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated: Boolean(admin),
        login,
        logout,
        refreshAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
