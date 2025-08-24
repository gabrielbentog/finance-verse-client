export interface Subscription {
  id: number;
  name: string;
  category: 'Serviço' | 'Produto' | 'Assinatura' | 'Outro';
  amount: number;
  isVariableAmount: boolean;
  paymentMethod: string;
  frequency: 'Mensal' | 'Anual' | 'Semanal' | 'Única';
  billingDay: string;
  status: 'Ativa' | 'Pausada' | 'Cancelada';
  startDate: string;
  totalSpent: number;
  lastUsed?: string;
}

export interface SubscriptionAlert {
  type: 'próxima_cobrança' | 'duplicada' | 'sem_uso';
  subscriptionId: number;
  message: string;
}

export interface SubscriptionAnalytics {
  totalMonthly: number;
  percentageOfExpenses: number;
  monthlyTrend: Array<{
    month: string;
    total: number;
  }>;
  // Novo campo vindo do endpoint analytics
  activeSubscriptionsCount?: number;
}
