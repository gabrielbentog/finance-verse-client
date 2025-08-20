import { create } from 'zustand';

interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  value: number;
  category: string;
  description: string;
  date: string;
}

interface FinanceStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  transactions: [
    {
      id: '1',
      type: 'receita',
      value: 5000,
      category: 'Salário',
      description: 'Salário mensal',
      date: '2025-08-05',
    },
    {
      id: '2',
      type: 'despesa',
      value: 1000,
      category: 'Alimentação',
      description: 'Compras do mês',
      date: '2025-08-10',
    },
    {
      id: '3',
      type: 'despesa',
      value: 800,
      category: 'Transporte',
      description: 'Combustível',
      date: '2025-08-15',
    },
  ],
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [
        ...state.transactions,
        { ...transaction, id: Math.random().toString() },
      ],
    })),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
}));
