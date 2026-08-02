import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const { id } = await params;

    if (['AMC', 'IGN'].includes(session.accessLevel) && session.id !== id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const member = await db.member.findUnique({
      where: { id },
      include: {
        documents: { orderBy: { createdAt: 'desc' }, take: 10 },
        cashTransactions: { orderBy: { createdAt: 'desc' }, take: 10, include: { register: true } },
        uniformOrders: { orderBy: { createdAt: 'desc' }, take: 10 },
        notifications: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!member) return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 });
    // Don't send password hash
    const { passwordHash, recoveryCode, recoveryExpiry, ...safeMember } = member;
    return NextResponse.json({ member: safeMember });
  } catch (error) {
    console.error('Member GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
