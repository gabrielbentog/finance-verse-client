export interface Subscription {
  id: number;
  name: string;
  category: 'Lazer' | 'Educação' | 'Utilidade' | 'Trabalho';
  amount: number;
  isVariableAmount: boolean;
  paymentMethod: string;
  frequency: 'mensal' | 'anual' | 'semanal';
  nextBillingDate: string;
  status: 'ativa' | 'cancelada' | 'em teste';
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
}
