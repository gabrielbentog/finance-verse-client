'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { UserData } from '@/types/auth';
import { AuthService } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserData | null;
  login: (email: string, password: string) => Promise<UserData>;
  register: (name: string, email: string, password: string) => Promise<UserData>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  updateUser?: (user: UserData | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = async () => {
      try {
        if (typeof window !== 'undefined' && AuthService.isAuthenticated()) {
          // Obter dados do usuário do localStorage
          const userData = AuthService.getUserData();
          if (userData) {
            setUser(userData);
          }
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.login(email, password);
      
      // O AuthService já salvou o token em cookie e os dados do usuário no localStorage
      const userData = response.data.data;
      console.log(response)
      setUser(userData);
      try {
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (e) {
        console.warn('Não foi possível salvar user no localStorage após login', e);
      }
      
      // Redirecionar para o dashboard após o login bem-sucedido
      router.push('/dashboard');
      
      return userData;
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'error' in err) {
        setError((err as { error: string }).error);
      } else {
        setError('Erro ao realizar login. Tente novamente.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.register(name, email, password);
      
      // O AuthService já salvou o token em cookie e os dados do usuário no localStorage
      const userData = response.data.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      // Redirecionar para o dashboard após o registro bem-sucedido
      router.push('/dashboard');
      
      return userData;
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'error' in err) {
        setError((err as { error: string }).error);
      } else {
        setError('Erro ao realizar cadastro. Tente novamente.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, error, updateUser: setUser }}>
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
