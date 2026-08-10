import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const [
      { data: memberRaw },
      { count: totalDocs },
      { count: totalOrders },
      { count: totalTx },
      { count: unreadMsgs },
      { count: unreadNotifs },
    ] = await Promise.all([
      supabaseAdmin.from('members').select('*').eq('id', session.id).single(),
      supabaseAdmin.from('documents').select('*', { count: 'exact', head: true }).eq('member_id', session.id),
      supabaseAdmin.from('uniform_orders').select('*', { count: 'exact', head: true }).eq('member_id', session.id),
      supabaseAdmin.from('cash_transactions').select('*', { count: 'exact', head: true }).eq('member_id', session.id).eq('status', 'COMPLETED'),
      supabaseAdmin.from('message_recipients').select('*', { count: 'exact', head: true }).eq('recipient_id', session.id).eq('is_read', false),
      supabaseAdmin.from('notifications').select('*', { count: 'exact', head: true }).eq('member_id', session.id).eq('status', 'UNREAD'),
    ]);

    const member = memberRaw ? {
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
    } : null;

    return NextResponse.json({
      member,
      stats: {
        totalDocs: totalDocs || 0,
        totalOrders: totalOrders || 0,
        totalTx: totalTx || 0,
        unreadMsgs: unreadMsgs || 0,
        unreadNotifs: unreadNotifs || 0,
      },
    });
  } catch (error) {
    console.error('Stats GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
