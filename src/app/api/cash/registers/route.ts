import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!canAccess(session.accessLevel, 'MASTER')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const registers = await db.cashRegister.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { transactions: true } },
        creator: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ registers });
  } catch (error) {
    console.error('Registers GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
