import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const BACKEND_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
  : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

export const API_URL = import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`;

async function safeFetch(url: string, options?: RequestInit): Promise<{ res: Response; data: any }> {
  const res = await fetch(url, options);
  let data: any = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = null; }
  }
  if (!data && res.ok) {
    throw new Error(`Expected JSON from server but got empty response. Make sure VITE_API_URL is set correctly in your deployment environment.`);
  }
  if (!data && !res.ok) {
    throw new Error(`Server returned ${res.status} with no response body. Make sure VITE_API_URL is set correctly.`);
  }
  return { res, data };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'entrepreneur' | 'investor';
  bio?: string;
  location?: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('nexus_token');
    const savedUser = localStorage.getItem('nexus_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string, role: string) => {
    const { res, data } = await safeFetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!res.ok) throw new Error(data?.message || 'Registration failed');
  };

  const login = async (email: string, password: string, role: string) => {
    const { res, data } = await safeFetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error(data?.message || 'Login failed with status ' + res.status);

    if (data.user.role.toLowerCase() !== role.toLowerCase()) {
      throw new Error(`This account is registered as ${data.user.role}, not ${role}`);
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('nexus_token', data.token);
    localStorage.setItem('nexus_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
  };

  const forgotPassword = async (email: string) => {
    const { res, data } = await safeFetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error(data?.message || 'Failed to send reset email');
  };

  const resetPassword = async (token: string, password: string) => {
    const { res, data } = await safeFetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) throw new Error(data?.message || 'Failed to reset password');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, register, logout, forgotPassword, resetPassword, isLoading, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};