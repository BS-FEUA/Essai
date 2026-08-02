import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    // Personal stats for the logged-in member
    const member = await db.member.findUnique({ where: { id: session.id } });
    const totalDocs = await db.document.count({ where: { memberId: session.id } });
    const totalOrders = await db.uniformOrder.count({ where: { memberId: session.id } });
    const totalTx = await db.cashTransaction.count({ where: { memberId: session.id, status: 'COMPLETED' } });
    const unreadMsgs = await db.messageRecipient.count({ where: { recipientId: session.id, isRead: false } });
    const unreadNotifs = await db.notification.count({ where: { memberId: session.id, status: 'UNREAD' } });

    return NextResponse.json({
      member,
      stats: { totalDocs, totalOrders, totalTx, unreadMsgs, unreadNotifs },
    });
  } catch (error) {
    console.error('Stats GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
