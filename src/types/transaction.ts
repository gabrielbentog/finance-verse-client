export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
  userId: string;
}

export interface TransactionInput {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export const TRANSACTION_CATEGORIES = {
  INCOME: [
    'Salário',
    'Freelance',
    'Investimentos',
    'Outros'
  ],
  EXPENSE: [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Outros'
  ]
} as const;
