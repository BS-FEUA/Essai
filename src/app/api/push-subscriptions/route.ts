import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

const tokenSchema = z.object({ token: z.string().min(20).max(4096) });

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const parsed = tokenSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Jeton invalide' }, { status: 400 });

    const { error } = await supabaseAdmin.from('push_subscriptions').upsert({
      member_id: session.id,
      token: parsed.data.token,
      user_agent: request.headers.get('user-agent')?.slice(0, 500) || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'token' });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscription POST error:', error);
    return NextResponse.json({ error: 'Impossible d’enregistrer ce navigateur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const parsed = tokenSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Jeton invalide' }, { status: 400 });

    const { error } = await supabaseAdmin.from('push_subscriptions')
      .delete().eq('member_id', session.id).eq('token', parsed.data.token);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscription DELETE error:', error);
    return NextResponse.json({ error: 'Impossible de désactiver ce navigateur' }, { status: 500 });
  }
}
