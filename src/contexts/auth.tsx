'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula verificação de token
    const token = localStorage.getItem('token');
    if (token) {
      // Simula usuário autenticado
      setUser({
        id: '1',
        name: 'Usuário Teste',
        email: 'teste@example.com',
        createdAt: new Date().toISOString(),
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simula login
    const mockUser = {
      id: '1',
      name: 'Usuário Teste',
      email,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('token', 'mock-token');
    setUser(mockUser);
  };

  const register = async (name: string, email: string, password: string) => {
    // Simula registro
    const mockUser = {
      id: '1',
      name,
      email,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('token', 'mock-token');
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
