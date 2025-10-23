import { NextRequest, NextResponse } from 'next/server';
import { createBasicSession } from '@/lib/basic-auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      throw new Error('ID Token não fornecido');
    }
    
    // Para desenvolvimento, aceitar ID Token sem validação rigorosa
    // Em produção, implementar validação completa com Firebase Admin SDK
    console.log('🔐 Processando ID Token do Firebase...');
    
    // Decodificar JWT token (simplificado para desenvolvimento)
    try {
      const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      console.log('✅ Token decodificado:', payload);
      
      // Verificar se o token não expirou
      if (payload.exp && payload.exp < Date.now() / 1000) {
        throw new Error('Token expirado');
      }
      
      // Criar sessão com dados do token
      const sessionData = createBasicSession({
        uid: payload.user_id || payload.sub || 'admin-001',
        email: payload.email || 'admin@ohoje.com',
        name: payload.name || 'Administrador',
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
      
      console.log('✅ Sessão criada para:', payload.email);
      return NextResponse.json({ status: 'success' });
    } catch (decodeError) {
      console.error('❌ Erro ao decodificar token:', decodeError);
      throw new Error('Token inválido');
    }
  } catch (error) {
    console.error('❌ Erro ao criar sessão:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('__session');
  console.log('✅ Sessão removida');
  return NextResponse.json({ status: 'success' });
}
