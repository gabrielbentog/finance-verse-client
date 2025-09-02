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
    const normalized: Partial<UserData> = {
      ...(raw || {}),
      avatarUrl: (raw && (raw.avatarUrl ?? raw.avatar_url ?? raw.avatar)) ?? null,
    };
    return normalized as UserData;
  }
  // If avatar is explicitly null -> instruct server to remove avatar
  if (avatar === null) {
    const response = await userApi.put(`/users/${id}`, { user: { name, email, avatar: null } });
    const raw = response.data && response.data.data ? response.data.data : response.data;
    const normalized: Partial<UserData> = {
      ...(raw || {}),
      avatarUrl: (raw && (raw.avatarUrl ?? raw.avatar_url ?? raw.avatar)) ?? null,
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
  const normalized: Partial<UserData> = {
    ...(raw || {}),
    avatarUrl: (raw && (raw.avatarUrl ?? raw.avatarUrl ?? raw.avatar)) ?? null,
  };
  return normalized as UserData;
}
