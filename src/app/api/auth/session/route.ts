import { NextRequest, NextResponse } from 'next/server';
import { createBasicSession } from '@/lib/basic-auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { userData } = await request.json();
    
    // Para simplificar, aceitar dados do usuário diretamente
    // Em produção, você validaria o idToken com Firebase
    if (!userData || !userData.email) {
      throw new Error('Dados do usuário inválidos');
    }
    
    // Criar sessão básica
    const sessionData = createBasicSession({
      uid: userData.uid || 'admin-001',
      email: userData.email,
      name: userData.name || 'Administrador',
      role: 'admin',
      isActive: true
    });
    
    // Configurar cookie
    const cookieStore = await cookies();
    cookieStore.set('__session', sessionData, {
      maxAge: 60 * 60 * 24, // 24 horas
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    console.log('✅ Sessão criada para:', userData.email);
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('__session');
  console.log('✅ Sessão removida');
  return NextResponse.json({ status: 'success' });
}
