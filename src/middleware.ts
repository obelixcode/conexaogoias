import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('__session')?.value;
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  
  console.log('🔍 Middleware - Path:', request.nextUrl.pathname);
  console.log('🔍 Middleware - Session exists:', !!session);
  
  // Se não é uma rota admin, permitir acesso
  if (!isAdminRoute) {
    return NextResponse.next();
  }
  
  // Verificar se a sessão é válida (não é JWT do Firebase)
  let hasValidSession = false;
  if (session) {
    console.log('🔍 Middleware - Session type:', session.includes('.') ? 'JWT' : 'Base64');
    // Se contém pontos, é JWT do Firebase - não é válido
    if (!session.includes('.')) {
      try {
        // Tentar decodificar como base64
        const decoded = Buffer.from(session, 'base64').toString('utf-8');
        const userData = JSON.parse(decoded);
        console.log('🔍 Middleware - User data:', userData.email);
        
        // Verificar se não expirou
        if (userData.expiresAt && Date.now() < userData.expiresAt) {
          hasValidSession = true;
          console.log('✅ Middleware - Sessão válida');
        } else {
          console.log('❌ Middleware - Sessão expirada');
        }
      } catch (error) {
        console.log('❌ Middleware - Erro ao decodificar sessão:', error);
        hasValidSession = false;
      }
    } else {
      console.log('❌ Middleware - Sessão é JWT do Firebase (inválida)');
    }
  }
  
  // Se é página de login e tem sessão válida, redirecionar para dashboard
  if (isLoginPage && hasValidSession) {
    console.log('🔄 Middleware - Redirecionando para dashboard (já logado)');
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  // Se é rota admin (exceto login) e não tem sessão válida, redirecionar para login
  if (isAdminRoute && !isLoginPage && !hasValidSession) {
    console.log('🔄 Middleware - Redirecionando para login (sem sessão)');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  console.log('✅ Middleware - Permitindo acesso');
  
  // Add pathname to headers for layout to use
  const response = NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);
  
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
