import { Subscription, SubscriptionAlert, SubscriptionAnalytics } from '@/types/subscription';

const mockSubscriptions: Subscription[] = [
  {
    id: 1,
    name: 'Netflix',
    category: 'Lazer',
    amount: 55.90,
    isVariableAmount: false,
    paymentMethod: 'Cartão Nubank',
    frequency: 'mensal',
    nextBillingDate: '2025-09-05',
    status: 'ativa',
    startDate: '2023-01-01',
    totalSpent: 1117.80,
  },
  {
    id: 2,
    name: 'Spotify',
    category: 'Lazer',
    amount: 21.90,
    isVariableAmount: false,
    paymentMethod: 'Cartão Nubank',
    frequency: 'mensal',
    nextBillingDate: '2025-08-25',
    status: 'ativa',
    startDate: '2023-03-15',
    totalSpent: 394.20,
  },
  {
    id: 3,
    name: 'Academia Smart Fit',
    category: 'Utilidade',
    amount: 99.90,
    isVariableAmount: false,
    paymentMethod: 'Débito Automático',
    frequency: 'mensal',
    nextBillingDate: '2025-09-01',
    status: 'ativa',
    startDate: '2024-01-01',
    totalSpent: 798.20,
    lastUsed: '2025-08-15',
  },
  {
    id: 4,
    name: 'AWS',
    category: 'Trabalho',
    amount: 250.00,
    isVariableAmount: true,
    paymentMethod: 'Cartão Inter',
    frequency: 'mensal',
    nextBillingDate: '2025-09-01',
    status: 'ativa',
    startDate: '2024-06-01',
    totalSpent: 1750.00,
  },
  {
    id: 5,
    name: 'Curso Udemy',
    category: 'Educação',
    amount: 349.90,
    isVariableAmount: false,
    paymentMethod: 'PIX',
    frequency: 'anual',
    nextBillingDate: '2026-01-15',
    status: 'em teste',
    startDate: '2025-01-15',
    totalSpent: 349.90,
    lastUsed: '2025-05-20',
  },
];

const mockAlerts: SubscriptionAlert[] = [
  {
    type: 'próxima_cobrança',
    subscriptionId: 2,
    message: 'Sua fatura do Spotify vence amanhã',
  }
];

const mockAnalytics: SubscriptionAnalytics = {
  totalMonthly: 427.70,
  percentageOfExpenses: 32.5,
  monthlyTrend: [
    { month: 'Mai/25', total: 380.00 },
    { month: 'Jun/25', total: 395.00 },
    { month: 'Jul/25', total: 427.70 },
    { month: 'Ago/25', total: 427.70 },
  ],
};

export async function getSubscriptions(): Promise<Subscription[]> {
  // Simulando delay de API
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockSubscriptions;
}

export async function getSubscriptionAlerts(): Promise<SubscriptionAlert[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockAlerts;
}

export async function getSubscriptionAnalytics(): Promise<SubscriptionAnalytics> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockAnalytics;
}

export async function updateSubscriptionStatus(id: number, status: 'ativa' | 'cancelada' | 'em teste'): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Em uma implementação real, aqui faria a chamada à API
}
