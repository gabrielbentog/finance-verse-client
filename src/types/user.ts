// Mantendo para compatibilidade, mas agora vamos usar principalmente o UserData de auth.ts
export interface User {
  id: string | number;
  name: string;
  email: string;
  createdAt?: string;
  avatar_url?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}
