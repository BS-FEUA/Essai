import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const { id } = await params;

    if (['AMC', 'IGN'].includes(session.accessLevel) && session.id !== id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { data: memberRaw, error: memberError } = await supabaseAdmin
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (memberError || !memberRaw) return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 });

    // Fetch related data in parallel
    const [
      { data: documents },
      { data: cashTransactions },
      { data: uniformOrders },
      { data: notifications },
    ] = await Promise.all([
      supabaseAdmin.from('documents').select('*').eq('member_id', id).order('created_at', { ascending: false }).limit(10),
      supabaseAdmin.from('cash_transactions').select('*, register:cash_registers(*)').eq('member_id', id).order('created_at', { ascending: false }).limit(10),
      supabaseAdmin.from('uniform_orders').select('*').eq('member_id', id).order('created_at', { ascending: false }).limit(10),
      supabaseAdmin.from('notifications').select('*').eq('member_id', id).order('created_at', { ascending: false }).limit(5),
    ]);

    const member = {
      ...memberRaw,
      firstName: memberRaw.first_name,
      lastName: memberRaw.last_name,
      accessLevel: memberRaw.access_level,
      photoUrl: memberRaw.photo_url,
      ficheSoumise: memberRaw.fiche_soumise,
      carteEtudiant: memberRaw.carte_etudiant,
      lastLoginAt: memberRaw.last_login_at,
      dateOfBirth: memberRaw.date_of_birth,
      createdAt: memberRaw.created_at,
      updatedAt: memberRaw.updated_at,
      documents: (documents || []).map(d => ({ ...d, fileName: d.file_name, fileSize: d.file_size, mimeType: d.mime_type, fileUrl: d.file_url, memberId: d.member_id })),
      cashTransactions: (cashTransactions || []).map(t => ({ ...t, registerId: t.register_id, memberId: t.member_id })),
      uniformOrders: (uniformOrders || []).map(o => ({ ...o, memberId: o.member_id, totalAmount: o.total_amount })),
      notifications: (notifications || []).map(n => ({ ...n, memberId: n.member_id })),
    };

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Member GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
