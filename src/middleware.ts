import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('__session')?.value;
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  
  // Logs removidos para reduzir ruído no console
  
  // Se não é uma rota admin, permitir acesso
  if (!isAdminRoute) {
    return NextResponse.next();
  }
  
  // Verificar se a sessão é válida (não é JWT do Firebase)
  let hasValidSession = false;
  if (session) {
    // Se contém pontos, é JWT do Firebase - não é válido
    if (!session.includes('.')) {
      try {
        // Tentar decodificar como base64
        const decoded = Buffer.from(session, 'base64').toString('utf-8');
        const userData = JSON.parse(decoded);
        
        // Verificar se não expirou
        if (userData.expiresAt && Date.now() < userData.expiresAt) {
          hasValidSession = true;
        }
      } catch {
        hasValidSession = false;
      }
    }
  }
  
  // Se é página de login e tem sessão válida, redirecionar para dashboard
  if (isLoginPage && hasValidSession) {
    console.log('🔄 Middleware - Redirecionando usuário logado para dashboard');
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  // Se é rota admin (exceto login) e não tem sessão válida, redirecionar para login
  if (isAdminRoute && !isLoginPage && !hasValidSession) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // Add pathname to headers for layout to use
  const response = NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);
  
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
