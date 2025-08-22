import axios from 'axios';
import { Movement, MovementResponse, MovementListResponse, MovementCreateRequest, MovementUpdateRequest } from '../types/movement';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const movementApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função para obter o token do cookie
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

// Interceptor para adicionar o token de autorização em todas as requisições
movementApi.interceptors.request.use(config => {
  if (typeof window === 'undefined') return config;
  // Não adicionar token em login/cadastro
  if (config.url?.includes('/authenticate') || config.url?.includes('/users')) {
    return config;
  }
  const token = getCookie(TOKEN_COOKIE_NAME);
  console.log(token)
  if (token) {
    config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return config;
});

export interface MovementFilter {
  user_id?: number;
  movement_type?: 'income' | 'expense';
  category?: string;
  date_range?: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export async function getMovements(
  filters?: MovementFilter,
  pagination: PaginationParams = { page: 1, per_page: 10 }
): Promise<MovementListResponse> {
  // Converter os filtros para o formato filter[chave]
  const filterParams = filters
    ? Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[`filter[${key}]`] = value;
      }
      return acc;
    }, {} as Record<string, any>)
    : {};

  // Adicionar parâmetros de paginação
  const params = {
    ...filterParams,
    'page[number]': pagination.page,
    'page[size]': pagination.per_page,
  };

  const response = await movementApi.get('/movements', {
    params,
  });
  return response.data;
}

export async function getMovement(id: number): Promise<MovementResponse> {
  const response = await movementApi.get(`/movements/${id}`);
  return response.data;
}

export async function createMovement(data: MovementCreateRequest): Promise<MovementResponse> {
  const response = await movementApi.post('/movements', { movement: data });
  return response.data;
}

export async function updateMovement(id: number, data: MovementUpdateRequest): Promise<MovementResponse> {
  const response = await movementApi.put(`/movements/${id}`, { movement: data });
  return response.data;
}

export async function deleteMovement(id: number): Promise<void> {
  await movementApi.delete(`/movements/${id}`);
}
