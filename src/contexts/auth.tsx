'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { UserData } from '@/types/auth';
import { AuthService } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserData | null;
  login: (email: string, password: string) => Promise<UserData | Record<string, unknown>>;
  // quando 2FA é necessário, o login pode retornar um payload bruto contendo
  // { two_factor_required: true, temp_auth_token: '...' }
  // por isso permitimos também Record<string, unknown>
  // (consumidor pode checar e tratar a etapa adicional)
  
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

      // Se o backend indicar que 2FA é necessário, retorne o payload bruto
      // Normalizar o corpo da resposta (alguns backends retornam { data: { ... } } )
      const maybe = response.data as Record<string, unknown> | null;
      const body = (maybe && typeof maybe === 'object' && maybe['data'] && typeof maybe['data'] === 'object') ? (maybe['data'] as Record<string, unknown>) : (maybe as Record<string, unknown>);

      // Detectar variantes de resposta que indicam 2FA: campo booleano ou status string
      const status = typeof body?.['status'] === 'string' ? (body['status'] as string) : undefined;
      const twoReq = status === '2fa_required' || body?.['two_factor_required'] === true || body?.['status'] === 'two_factor_required';
      if (twoReq) {
        // Retorna o payload (original) para que a página de login trate a etapa 2FA
        return response.data as unknown as Record<string, unknown>;
      }

      // Caso contrário, comportamento normal: salvar user e redirecionar
      const userData = response.data && (response.data as Record<string, unknown>)['data'] ? (response.data as Record<string, unknown>)['data'] as UserData : null;
      if (userData) {
        setUser(userData);
        try {
          (await import('@/services/userService')).saveUserToStorage(userData as unknown as Record<string, unknown>)
        } catch (e) {
          console.warn('Não foi possível salvar user no localStorage após login', e);
        }
      }

      // Redirecionar para o dashboard após o login bem-sucedido
      router.push('/dashboard');

      return userData as UserData;
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
  try { (await import('@/services/userService')).saveUserToStorage(userData as unknown as Record<string, unknown>) } catch {}
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

  const persistUser = (u: UserData | null) => {
    setUser(u)
    try {
      if (u) (async () => { try { (await import('@/services/userService')).saveUserToStorage(u as unknown as Record<string, unknown>) } catch {} })()
      else localStorage.removeItem('user')
    } catch (e) {
      console.warn('Não foi possível persistir user no localStorage via updateUser', e)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, error, updateUser: persistUser }}>
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
