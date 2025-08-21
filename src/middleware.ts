import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar se o token de autenticação está presente no cookie
  const authToken = request.cookies.get('auth_token')?.value;
  const url = request.nextUrl.clone();
  
  // Rotas que não devem ser acessadas quando o usuário está logado
  const authRoutes = ['/login', '/register'];
  
  // Rota atual (sem o domínio, apenas o caminho)
  const path = url.pathname;
  
  // Se o usuário está logado e tentando acessar uma rota de autenticação
  if (authToken && authRoutes.some(route => path.startsWith(route))) {
    // Redirecionar para o dashboard
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  // Caso contrário, permite a requisição normal
  return NextResponse.next();
}

// Configurar em quais rotas o middleware será executado
export const config = {
  matcher: ['/login', '/register'],
};
