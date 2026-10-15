import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!canAccess(session.accessLevel, 'MASTER')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const { data: registersRaw, error } = await supabaseAdmin
      .from('cash_registers')
      .select(`
        *,
        creator:members!cash_registers_created_by_fkey(first_name, last_name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const registers = (registersRaw || []).map(r => ({
      ...r,
      createdBy: r.created_by,
      isActive: r.is_active,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      creator: r.creator ? {
        firstName: Array.isArray(r.creator) ? r.creator[0].first_name : r.creator.first_name,
        lastName: Array.isArray(r.creator) ? r.creator[0].last_name : r.creator.last_name,
      } : null,
    }));

    return NextResponse.json({ registers });
  } catch (error) {
    console.error('Registers GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
