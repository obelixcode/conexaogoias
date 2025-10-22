import { NextRequest, NextResponse } from 'next/server';
import { BannerService } from '@/lib/bannerService';

export async function POST(request: NextRequest) {
  try {
    const { bannerId, position } = await request.json();
    
    if (!bannerId) {
      return NextResponse.json({ error: 'Banner ID é obrigatório' }, { status: 400 });
    }

    // Registrar o clique do banner
    await BannerService.recordBannerClick(bannerId, position || 'sidebar-top', {
      userAgent: request.headers.get('user-agent') || undefined,
      referrer: request.headers.get('referer') || undefined,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar clique do banner:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
