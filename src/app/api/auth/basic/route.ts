import { NextRequest, NextResponse } from 'next/server';
import { authenticateBasicUser, createBasicSession } from '@/lib/basic-auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Autenticar usuário via sistema básico
    const user = authenticateBasicUser(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }
    
    // Criar sessão
    const sessionToken = createBasicSession(user);
    console.log('🔧 Sessão criada para:', user.email);
    
    // Definir cookie de sessão
    const cookieStore = await cookies();
    cookieStore.set('__session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/'
    });
    console.log('✅ Cookie de sessão definido');
    
    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });
    
  } catch (error) {
    console.error('Erro na autenticação básica:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
