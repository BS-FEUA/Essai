import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, canSendMessage } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'PLENIARY';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');

    const where: any = { scope };

    if (scope === 'PRIVATE') {
      where.OR = [
        { senderId: session.id },
        { recipients: { some: { recipientId: session.id } } },
      ];
    }

    const messages = await db.message.findMany({
      where, skip: (page - 1) * limit, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, accessLevel: true, photoUrl: true } },
        recipients: { where: { recipientId: session.id }, select: { id: true, isRead: true, readAt: true } },
        _count: { select: { recipients: true } },
      },
    });

    // Mark as read
    const unreadIds = messages
      .map(m => m.recipients[0])
      .filter((r) => r && !r.isRead)
      .map(r => r.id);
    if (unreadIds.length > 0) {
      await db.messageRecipient.updateMany({ where: { id: { in: unreadIds } }, data: { isRead: true, readAt: new Date() } });
    }

    const total = await db.message.count({ where });
    return NextResponse.json({ messages: messages.reverse(), total, page, limit });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { content, scope, recipientId } = body;

    if (!content || !content.trim()) return NextResponse.json({ error: 'Message vide' }, { status: 400 });

    const messageScope = scope || 'PLENIARY';

    // Check messaging rules
    if (messageScope === 'PRIVATE' && recipientId) {
      const recipient = await db.member.findUnique({ where: { id: recipientId } });
      if (!recipient) return NextResponse.json({ error: 'Destinataire non trouvé' }, { status: 404 });
      if (!canSendMessage(session.accessLevel, recipient.accessLevel)) {
        return NextResponse.json({ error: 'Règles hiérarchiques : vous ne pouvez pas envoyer de message à ce niveau' }, { status: 403 });
      }
    }

    const message = await db.message.create({
      data: { content: content.trim(), scope: messageScope, senderId: session.id },
    });

    // Add recipients
    if (messageScope === 'PLENIARY') {
      const activeMembers = await db.member.findMany({ where: { status: 'ACTIVE' }, select: { id: true } });
      await db.messageRecipient.createMany({
        data: activeMembers.filter(m => m.id !== session.id).map(m => ({ messageId: message.id, recipientId: m.id })),
      });
    } else if (recipientId) {
      await db.messageRecipient.create({ data: { messageId: message.id, recipientId } });
      // Also add self as recipient for display
      await db.messageRecipient.create({ data: { messageId: message.id, recipientId: session.id, isRead: true } });
    }

    await db.auditLog.create({
      data: { action: 'MESSAGE_SEND', actorId: session.id, entityType: 'Message', entityId: message.id, details: `Message ${messageScope}` },
    });

    const fullMessage = await db.message.findUnique({
      where: { id: message.id },
      include: { sender: { select: { id: true, firstName: true, lastName: true, accessLevel: true, photoUrl: true } } },
    });

    return NextResponse.json({ success: true, message: fullMessage }, { status: 201 });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
