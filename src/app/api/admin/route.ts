import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!canAccess(session.accessLevel, 'MAST_IN')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section') || 'overview';

    // Overview stats
    if (section === 'overview') {
      const [
        totalMembers,
        activeMembers,
        pendingMembers,
        totalBalance,
        totalTransactions,
        totalOrders,
        pendingOrders,
        recentLogins,
      ] = await Promise.all([
        db.member.count(),
        db.member.count({ where: { status: 'ACTIVE' } }),
        db.member.count({ where: { status: 'PENDING_VALIDATION' } }),
        db.cashRegister.aggregate({ _sum: { balance: true } }),
        db.cashTransaction.count({ where: { status: 'COMPLETED' } }),
        db.uniformOrder.count(),
        db.uniformOrder.count({ where: { status: 'EN_ATTENTE' } }),
        db.member.count({ where: { lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      ]);

      const membersByLevel = await db.member.groupBy({
        by: ['accessLevel'],
        _count: true,
      });

      const membersByInstitution = await db.member.groupBy({
        by: ['institution'],
        where: { institution: { not: null } },
        _count: true,
      });

      const membersByFiliere = await db.member.groupBy({
        by: ['filiere'],
        where: { filiere: { not: null } },
        _count: true,
      });

      const ficheStats = await db.member.groupBy({
        by: ['ficheSoumise'],
        _count: true,
      });

      return NextResponse.json({
        totalMembers, activeMembers, pendingMembers,
        totalBalance: totalBalance._sum.balance || 0,
        totalTransactions, totalOrders, pendingOrders, recentLogins,
        membersByLevel, membersByInstitution, membersByFiliere, ficheStats,
      });
    }

    // Audit logs (Mémoire H)
    if (section === 'audit') {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '30');
      const action = searchParams.get('action') || '';
      const actorId = searchParams.get('actorId') || '';

      const where: any = {};
      if (action) where.action = action;
      if (actorId) where.actorId = actorId;

      const [logs, total] = await Promise.all([
        db.auditLog.findMany({
          where, skip: (page - 1) * limit, take: limit,
          orderBy: { createdAt: 'desc' },
          include: { actor: { select: { id: true, firstName: true, lastName: true, matricule: true, accessLevel: true } } },
        }),
        db.auditLog.count({ where }),
      ]);

      return NextResponse.json({ logs, total, page, limit, pages: Math.ceil(total / limit) });
    }

    return NextResponse.json({ error: 'Section non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
