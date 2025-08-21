// Tipos para autenticação

// Credenciais para requisição de login
export interface AuthCredentials {
  authentication: {
    email: string;
    password: string;
  };
}

// Dados para registro de usuário
export interface RegisterData {
  user: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  };
}

// Resposta da API após autenticação bem-sucedida
export interface AuthResponse {
  data: UserData;
}

// Dados do usuário
export interface UserData {
  id: number;
  email: string;
  name: string;
  avatar_url: string | null;
}

// Headers de autenticação
export interface AuthHeaders {
  'access-token': string;
  client: string;
  uid: string;
  expiry?: string;
  'token-type'?: string;
}

// Erro de autenticação
export interface AuthError {
  error: string;
}
