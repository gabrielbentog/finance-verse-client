import axios, { AxiosResponse } from 'axios';
import { AuthCredentials, AuthResponse, AuthError, RegisterData, UserData } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_COOKIE_NAME = 'auth_token';
const USER_STORAGE_KEY = 'user';

// Configuração da instância do axios para autenticação
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Funções auxiliares para manipular cookies
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof window === 'undefined') return;

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);

  const cookieValue = encodeURIComponent(value) +
    '; expires=' + expirationDate.toUTCString() +
    '; path=/; SameSite=Lax';

  document.cookie = name + '=' + cookieValue;
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;

  const nameWithEqual = name + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');

  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i].trim();
    if (cookie.indexOf(nameWithEqual) === 0) {
      return cookie.substring(nameWithEqual.length, cookie.length);
    }
  }

  return null;
};

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

// Classe para gerenciar a autenticação
export class AuthService {

  // Login do usuário
  static async login(email: string, password: string): Promise<{ data: Record<string, unknown> | null; token: string | null; }> {
    try {
      const credentials: AuthCredentials = {
        authentication: { email, password }
      };

      const response = await authApi.post('/authenticate', credentials);

      // Extrair o token de autorização (se presente)
      const authToken = response.headers['authorization'] ?? null;

      // Se o backend retornou um token de sessão direto, salvar no cookie
      if (authToken) {
        setCookie(TOKEN_COOKIE_NAME, authToken);
      }

      // Caso a resposta contenha dados de usuário (login completo), salvar no localStorage
      if (response.data && response.data.data) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.data));
      }

      return { data: response.data, token: authToken };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data as AuthError;
      }
      throw { error: 'Erro ao conectar com o servidor' };
    }
  }

  // Registro de novo usuário
  static async register(name: string, email: string, password: string): Promise<{ data: AuthResponse; token: string }> {
    try {
      const registerData: RegisterData = {
        user: {
          name,
          email,
          password,
          password_confirmation: password
        }
      };

      const response: AxiosResponse<AuthResponse> = await authApi.post('/users', registerData);

      // Extrair o token de autorização
      const authToken = response.headers['authorization'];

      // Guardar o token em cookie
      if (authToken) {
        setCookie(TOKEN_COOKIE_NAME, authToken);
      }

      // Guardar dados do usuário no localStorage
      if (response.data && response.data.data) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.data));
      }

      return { data: response.data, token: authToken };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data as AuthError;
      }
      throw { error: 'Erro ao conectar com o servidor' };
    }
  }

  // Verificar se o usuário está autenticado
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    // Verificar se existe um token no cookie
    const token = getCookie(TOKEN_COOKIE_NAME);
    return !!token;
  }

  // Obter o token de autenticação
  static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    return getCookie(TOKEN_COOKIE_NAME);
  }

  // Obter dados do usuário
  static getUserData(): UserData | null {
    if (typeof window === 'undefined') return null;

    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return null;
    }
  }

  // Limpar dados de autenticação
  static logout(): void {
    if (typeof window === 'undefined') return;

    // Remover token do cookie
    deleteCookie(TOKEN_COOKIE_NAME);

    // Remover dados do usuário do localStorage
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

// Interceptor para adicionar o token de autenticação em todas as requisições
authApi.interceptors.request.use(config => {
  if (typeof window === 'undefined') return config;

  const token = AuthService.getAuthToken();

  if (token) {
    config.headers['Authorization'] = token;
  }

  return config;
});

export default authApi;

// Endpoint to verify two-factor during login
// Verificação durante login usando temp_auth_token
export async function verifyTwoFactorDuringLogin(tempAuthToken: string, code: string): Promise<import('@/types/auth').UserData | null> {
  // o backend espera o campo `temp_auth_token`; aceitar também tempAuthToken de callers
  const payload = { temp_auth_token: tempAuthToken, tempAuthToken: tempAuthToken, tempToken: tempAuthToken, code };
  const response = await authApi.post(`/verify_2fa`, payload);

  // extrair possível objeto user (pode vir em different shapes)
  const raw = response.data && response.data.data ? response.data.data : response.data;
  let userObj: Record<string, unknown> | null = null;

  if (raw && typeof raw === 'object') {
    // se raw conter user: { ... }
    if ('user' in (raw as Record<string, unknown>) && typeof (raw as Record<string, unknown>)['user'] === 'object') {
      userObj = (raw as Record<string, unknown>)['user'] as Record<string, unknown>;
    } else if ((raw as Record<string, unknown>)['id']) {
      // raw é o próprio user
      userObj = raw as Record<string, unknown>;
    }
  }

  // Se o backend retornar token nos headers, salve o cookie
  const authToken = response.headers['authorization'] ?? null;
  if (authToken) setCookie(TOKEN_COOKIE_NAME, authToken);

  // Caso tenhamos um userObj, normalize e salve em localStorage
  if (userObj) {
    const normalized: UserData = {
      id: String(userObj['id']),
      email: typeof userObj['email'] === 'string' ? (userObj['email'] as string) : '',
      name: typeof userObj['name'] === 'string' ? (userObj['name'] as string) : '',
      avatarUrl: (userObj['avatar_url'] || userObj['avatarUrl'] || userObj['avatar']) as string | null || null,
      twoFactorEnabled: Boolean(userObj['two_factor_enabled'] || userObj['twoFactorEnabled'] || userObj['two_factor_enabled?']),
    };

    try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized)); } catch {}
    return normalized;
  }

  return null;
}
