import axios from 'axios';
import { UserData } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const userApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

const TOKEN_COOKIE_NAME = 'auth_token';

userApi.interceptors.request.use(config => {
  if (typeof window === 'undefined') return config;
  if (config.url?.includes('/authenticate')) return config;
  const token = getCookie(TOKEN_COOKIE_NAME);
  if (token) {
    config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return config;
});

export async function updateProfile(payload: { id: number | string; name?: string; email?: string; avatar?: File | null; }): Promise<UserData> {
  const { id, name, email, avatar } = payload;
  // If avatar is a File -> send multipart/form-data with the file
  if (avatar instanceof File) {
    const form = new FormData();
    if (name !== undefined) form.append('user[name]', name);
    if (email !== undefined) form.append('user[email]', email);
    form.append('user[avatar]', avatar);
    const response = await userApi.put(`/users/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    const raw = response.data && response.data.data ? response.data.data : response.data;
    // Normalizar campos retornados para o formato usado no frontend
    const tf = raw && (raw.two_factor_enabled ?? raw.twoFactorEnabled ?? raw['two_factor_enabled?']);
    const normalized: Partial<UserData> = {
      ...(raw || {}),
      avatarUrl: (raw && (raw.avatarUrl ?? raw.avatar_url ?? raw.avatar)) ?? null,
      twoFactorEnabled: Boolean(tf),
    };
    return normalized as UserData;
  }
  // If avatar is explicitly null -> instruct server to remove avatar
  if (avatar === null) {
    const response = await userApi.put(`/users/${id}`, { user: { name, email, avatar: null } });
    const raw = response.data && response.data.data ? response.data.data : response.data;
    const tf = raw && (raw.two_factor_enabled ?? raw.twoFactorEnabled ?? raw['two_factor_enabled?']);
    const normalized: Partial<UserData> = {
      ...(raw || {}),
      avatarUrl: (raw && (raw.avatarUrl ?? raw.avatar_url ?? raw.avatar)) ?? null,
      twoFactorEnabled: Boolean(tf),
    };
    return normalized as UserData;
  }

  // Default: update only name/email
  const response = await userApi.put(`/users/${id}`, { user: { name, email } });
  const raw = response.data && response.data.data ? response.data.data : response.data;
  const normalized: Partial<UserData> = {
    ...(raw || {}),
    avatarUrl: (raw && (raw.avatarUrl ?? raw.avatar_url ?? raw.avatar)) ?? null,
  };
  return normalized as UserData;
}

export async function getUserById(id: number | string): Promise<UserData> {
  const response = await userApi.get(`/users/${id}`);
  const raw = response.data && response.data.data ? response.data.data : response.data;
  const tf = raw && (raw.two_factor_enabled ?? raw.twoFactorEnabled ?? raw['two_factor_enabled?']);
  const normalized: Partial<UserData> = {
    ...(raw || {}),
    avatarUrl: (raw && (raw.avatarUrl ?? raw.avatar_url ?? raw.avatar)) ?? null,
    twoFactorEnabled: Boolean(tf),
  };
  return normalized as UserData;
}

// Two-factor endpoints
// 2FA: novo fluxo conforme documentação
export async function setupTwoFactor(): Promise<{
  provisioning_uri: string;
  issuer?: string;
  account?: string;
  secret?: string;
} | null> {
  const response = await userApi.post(`/two_factor/setup`);
  const raw = response.data && response.data.data ? response.data.data : response.data;
  return raw ?? null;
}

export async function enableTwoFactor(code: string): Promise<{ enabled: boolean; backup_codes?: string[] } | null> {
  const response = await userApi.post(`/two_factor/enable`, { code });
  const raw = response.data && response.data.data ? response.data.data : response.data;
  return raw ?? null;
}

export async function disableTwoFactor(): Promise<{ enabled: boolean } | null> {
  const response = await userApi.delete(`/two_factor/disable`);
  const raw = response.data && response.data.data ? response.data.data : response.data;
  return raw ?? null;
}

export async function regenerateBackupCodes(): Promise<{ backup_codes: string[] } | null> {
  const response = await userApi.post(`/two_factor/regenerate_backup_codes`);
  const raw = response.data && response.data.data ? response.data.data : response.data;
  return raw ?? null;
}

// helper: normalize user object and persist to localStorage
export function saveUserToStorage(rawUser: Record<string, unknown> | null | undefined) {
  if (typeof window === 'undefined') return;
  try {
    if (!rawUser) return;
    const tf = rawUser['two_factor_enabled'] ?? rawUser['twoFactorEnabled'] ?? rawUser['two_factor_enabled?'];
    const normalized: Partial<UserData> = {
      ...(rawUser as Record<string, unknown>),
      avatarUrl: (rawUser['avatarUrl'] ?? rawUser['avatar_url'] ?? rawUser['avatar']) as string | null ?? null,
      twoFactorEnabled: Boolean(tf),
    };
    localStorage.setItem('user', JSON.stringify(normalized));
  } catch {
    // ignore
  }
}
