import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const dashboardApi = axios.create({
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
dashboardApi.interceptors.request.use(config => {
  if (typeof window === 'undefined') return config;
  const token = getCookie(TOKEN_COOKIE_NAME);
  if (token) {
    config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return config;
});

export interface ApiDashboardData {
  data: {
    balance: number;
    income: number;
    expenses: number;
    expensesByCategory: Array<{
      id: string;
      value: number;
      label: string;
    }>;
    lastMonths: Array<{
      month: string;
      income: number;
      expenses: number;
    }>;
  };
}

export interface DashboardFilters {
  year?: string;
  month?: string;
}

export async function getDashboardData(filters?: DashboardFilters): Promise<ApiDashboardData> {
  const params = new URLSearchParams();
  if (filters?.year) params.append('year', filters.year);
  if (filters?.month) params.append('month', filters.month);

  const response = await dashboardApi.get(`/dashboard${params.toString() ? `?${params.toString()}` : ''}`);
  return response.data;
}
