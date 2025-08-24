import axios from 'axios';
import { Subscription, SubscriptionAlert, SubscriptionAnalytics } from '@/types/subscription';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const subscriptionApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função para obter cookie
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

// Interceptor para adicionar headers do Devise Token Auth (access-token, client, uid)
subscriptionApi.interceptors.request.use(config => {
  if (typeof window === 'undefined') return config;

  // não adicionar token em rotas de login/cadastro
  if (config.url?.includes('/authenticate') || config.url?.includes('/users')) {
    return config;
  }

  const accessToken = getCookie('access-token');
  const client = getCookie('client');
  const uid = getCookie('uid');

  if (accessToken && client && uid) {
    config.headers['access-token'] = accessToken;
    config.headers['client'] = client;
    config.headers['uid'] = uid;
    return config;
  }

  // fallback para auth_token (Authorization: Bearer ...)
  const token = getCookie(TOKEN_COOKIE_NAME);
  if (token) {
    config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  return config;
});

export interface SubscriptionFilter {
  status?: string;
  frequency?: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export async function getSubscriptions(
  filters?: SubscriptionFilter,
  pagination: PaginationParams = { page: 1, per_page: 10 }
): Promise<Subscription[]> {
  // Delega para getSubscriptionsRaw e retorna apenas o array (compatibilidade)
  const raw = await getSubscriptionsRaw(filters, pagination);
  if (raw && Array.isArray(raw.data)) return raw.data as Subscription[];
  return [];
}

// Retorna response.data bruto com possibilidade de meta (safe - não lança)
export async function getSubscriptionsRaw(
  filters?: SubscriptionFilter,
  pagination: PaginationParams = { page: 1, per_page: 10 }
): Promise<{ data: Subscription[]; meta?: Record<string, unknown> }> {
  const filterParams = filters
    ? Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) acc[`filter[${key}]`] = value;
      return acc;
    }, {} as Record<string, string | number>)
    : {};

  const params = {
    ...filterParams,
    'page[number]': pagination.page,
    'page[size]': pagination.per_page,
  };

  try {
    const response = await subscriptionApi.get('/subscriptions', { params });
    // Pode retornar { data: [...], meta: {...} } ou diretamente array
    if (response.data && response.data.data) return { data: response.data.data as Subscription[], meta: response.data.meta };
    if (Array.isArray(response.data)) return { data: response.data as Subscription[] };
    return { data: [] };
  } catch (error) {
    console.error('Error fetching subscriptions (raw)', error);
    return { data: [] };
  }
}

export async function getSubscription(id: string | number): Promise<Subscription> {
  const response = await subscriptionApi.get(`/subscriptions/${id}`);
  return response.data && response.data.data ? response.data.data : response.data;
}

export async function createSubscription(payload: Partial<Subscription>): Promise<Subscription> {
  const response = await subscriptionApi.post('/subscriptions', { subscription: payload });
  return response.data && response.data.data ? response.data.data : response.data;
}

export async function updateSubscription(id: string | number, payload: Partial<Subscription>): Promise<Subscription> {
  const response = await subscriptionApi.put(`/subscriptions/${id}`, { subscription: payload });
  return response.data && response.data.data ? response.data.data : response.data;
}

export async function deleteSubscription(id: string | number): Promise<void> {
  await subscriptionApi.delete(`/subscriptions/${id}`);
}

// Alerts - a API não descreveu endpoints explícitos para alerts; tentar rota /subscriptions/alerts e cair para mock
export async function getSubscriptionAlerts(): Promise<SubscriptionAlert[]> {
  try {
    const response = await subscriptionApi.get('/subscriptions/alerts', {
      // evitar lançar para 404, tratamos manualmente
      validateStatus: status => status >= 200 && status < 500,
    });
    if (response.status === 404) return [];
    return response.data && Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
  } catch (err) {
    console.error('Error fetching subscription alerts', err);
    return [];
  }
}

// Analytics - tentar endpoint /subscriptions/analytics, senão calcular um resumo simples a partir de /subscriptions
export async function getSubscriptionAnalytics(): Promise<SubscriptionAnalytics> {
  // Tenta primeiro o endpoint dedicado /subscriptions/analytics que agora fornece as KPIs
  try {
    const response = await subscriptionApi.get('/subscriptions/analytics', {
      validateStatus: status => status >= 200 && status < 500,
    });

    if (response.status === 200 || (response.data && (response.data.data || response.data))) {
      const payload = response.data && response.data.data ? response.data.data : response.data;
      // Mapeia naming da API para o formato interno
      const totalMonthly: number = Number(payload.totalMonthlySubscriptions ?? payload.totalMonthly ?? 0) || 0;
      const percentageOfExpenses: number = Number(payload.percentageOfTotalExpenses ?? payload.percentageOfExpenses ?? 0) || 0;
      const monthlyTrendRaw = payload.monthlyTrend ?? payload.monthly_trend ?? [];
      const monthlyTrend = Array.isArray(monthlyTrendRaw)
        ? monthlyTrendRaw.map((d: unknown) => {
          if (d && typeof d === 'object') {
            const dd = d as Record<string, unknown>;
            const month = typeof dd.month === 'string' ? dd.month : typeof dd.label === 'string' ? dd.label : String(dd.month ?? dd.label ?? '');
            const total = typeof dd.total === 'number' ? dd.total : typeof dd.value === 'number' ? dd.value : Number(dd.total ?? dd.value ?? 0) || 0;
            return { month: String(month), total };
          }
          return { month: '', total: 0 };
        })
        : [];
      const activeSubscriptionsCount = payload.activeSubscriptionsCount ?? payload.activeSubscriptions ?? undefined;

      return {
        totalMonthly,
        percentageOfExpenses,
        monthlyTrend,
        activeSubscriptionsCount: activeSubscriptionsCount !== undefined ? Number(activeSubscriptionsCount) : undefined,
      } as SubscriptionAnalytics;
    }

    // Se endpoint existir mas retornar 404/sem dados, cair para fallback abaixo
  } catch (err) {
    console.warn('Analytics endpoint not available or failed, falling back', err);
  }

  // Fallback: tentar usar meta do endpoint /subscriptions ou calcular resumo
  try {
    const raw = await getSubscriptionsRaw();
    if (raw.meta) {
      const meta = raw.meta;
      const totalMonthly = meta.totalAmount ?? meta.totalAmountMonthly ?? raw.data.reduce((acc, s) => acc + (s.amount || 0), 0);
      const percentageOfExpenses = meta.totalPercent ?? 0;
      const monthlyTrend = meta.monthlyTrend ?? [{ month: 'Últimos', total: totalMonthly }];
      const activeSubscriptionsCount = meta.activeSubscriptionsCount ?? undefined;
      return {
        totalMonthly,
        percentageOfExpenses,
        monthlyTrend,
        activeSubscriptionsCount,
      } as SubscriptionAnalytics;
    }

    const subs = raw.data || [];
    const totalMonthly = subs.reduce((acc, s) => acc + (s.amount || 0), 0);
    const monthlyTrend = [{ month: 'Últimos', total: totalMonthly }];
    return {
      totalMonthly,
      percentageOfExpenses: 0,
      monthlyTrend,
    } as SubscriptionAnalytics;
  } catch (e) {
    console.error('Error building analytics', e);
    return {
      totalMonthly: 0,
      percentageOfExpenses: 0,
      monthlyTrend: [],
    } as SubscriptionAnalytics;
  }
}

export async function updateSubscriptionStatus(id: number, status: 'Ativa' | 'Cancelada' | 'Pausada'): Promise<void> {
  // Envia apenas o campo de status
  await updateSubscription(id, { status });
}
