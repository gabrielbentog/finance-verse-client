import { Transaction } from '@/types/transaction';

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'INCOME',
    amount: 1000,
    category: 'Salário',
    description: 'Salário mensal',
    date: '2025-08-05',
    userId: '1'
  },
  {
    id: '2',
    type: 'EXPENSE',
    amount: 1500,
    category: 'Moradia',
    description: 'Aluguel',
    date: '2025-08-10',
    userId: '1'
  },
  {
    id: '3',
    type: 'EXPENSE',
    amount: 800,
    category: 'Alimentação',
    description: 'Supermercado',
    date: '2025-08-15',
    userId: '1'
  },
  {
    id: '4',
    type: 'INCOME',
    amount: 1200,
    category: 'Freelance',
    description: 'Projeto freelance',
    date: '2025-08-20',
    userId: '1'
  }
];

export function getTransactions(): Promise<Transaction[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTransactions);
    }, 500);
  });
}

export function addTransaction(transaction: Omit<Transaction, 'id' | 'userId'>): Promise<Transaction> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTransaction: Transaction = {
        ...transaction,
        id: Math.random().toString(36).substr(2, 9),
        userId: '1'
      };
      mockTransactions.push(newTransaction);
      resolve(newTransaction);
    }, 500);
  });
}
