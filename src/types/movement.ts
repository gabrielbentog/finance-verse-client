export type MovementType = 'income' | 'expense';

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
  };
}

export interface MovementCreateRequest {
  title: string;
  description?: string;
  amount: number;
  movement_type: MovementType;
  category: string;
  date: string;
}

export type MovementUpdateRequest = MovementCreateRequest;
