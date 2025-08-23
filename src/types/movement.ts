import { z } from 'zod';

export type MovementType = 'income' | 'expense';

export const transactionSchema = z.object({
  value: z.number().min(0.01, 'O valor deve ser maior que zero'),
  category: z.string().min(1, 'A categoria é obrigatória'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  date: z.string(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export interface Movement {
  id: number;
  title: string;
  description?: string;
  amount: number;
  movement_type: MovementType;
  category: string;
  date: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
  };
}

export interface MovementResponse {
  data: Movement;
}

export interface MovementListResponse {
  data: Movement[];
  meta: {
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      perPage: number;
    };
    totalAmount: number;
  };
};

export interface MovementCreateRequest {
  title: string;
  description?: string;
  amount: number;
  movement_type: MovementType;
  category: string;
  date: string;
}

export type MovementUpdateRequest = MovementCreateRequest;
