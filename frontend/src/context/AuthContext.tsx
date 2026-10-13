import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthTokens } from '../types';
import { apiClient } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const saveAuthSession = (userData: User, tokens: AuthTokens) => {
    localStorage.setItem('bma_access_token', tokens.access);
    localStorage.setItem('bma_refresh_token', tokens.refresh);
    localStorage.setItem('bma_user', JSON.stringify(userData));
    setUser(userData);
  };

  const clearAuthSession = () => {
    localStorage.removeItem('bma_access_token');
    localStorage.removeItem('bma_refresh_token');
    localStorage.removeItem('bma_user');
    setUser(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('bma_access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await apiClient.get<User>('/auth/me/');
      setUser(res.data);
      localStorage.setItem('bma_user', JSON.stringify(res.data));
    } catch {
      clearAuthSession();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial hydration from local storage
    const storedUser = localStorage.getItem('bma_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // fallback
      }
    }
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<{ user: User; tokens: AuthTokens }>('/auth/login/', {
      email,
      password,
    });
    saveAuthSession(res.data.user, res.data.tokens);
  };

  const register = async (data: any) => {
    const res = await apiClient.post<{ user: User; tokens: AuthTokens }>('/auth/register/', data);
    saveAuthSession(res.data.user, res.data.tokens);
  };

  const logout = () => {
    try {
      apiClient.post('/auth/logout/').catch(() => {});
    } finally {
      clearAuthSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
