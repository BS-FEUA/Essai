import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const [
      { data: notificationsRaw, error: notifError },
      { count: unreadCount, error: countError },
    ] = await Promise.all([
      supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('member_id', session.id)
        .order('created_at', { ascending: false })
        .limit(30),
      supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', session.id)
        .eq('status', 'UNREAD'),
    ]);

    if (notifError) throw notifError;
    if (countError) throw countError;

    const notifications = (notificationsRaw || []).map(n => ({
      ...n,
      memberId: n.member_id,
      createdAt: n.created_at,
      message: n.content,
      type: 'INFO',
    }));

    return NextResponse.json({ notifications, unreadCount: unreadCount || 0 });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { id, markAll } = body;

    if (markAll) {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ status: 'READ' })
        .eq('member_id', session.id)
        .eq('status', 'UNREAD');
      if (error) throw error;
    } else if (id) {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ status: 'READ' })
        .eq('id', id)
        .eq('member_id', session.id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications PUT error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
