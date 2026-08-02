import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, canAccess, ACCESS_HIERARCHY } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const accessLevel = searchParams.get('accessLevel') || '';
    const status = searchParams.get('status') || '';
    const institution = searchParams.get('institution') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } }, { lastName: { contains: search } },
        { matricule: { contains: search } }, { email: { contains: search } },
      ];
    }
    if (accessLevel) where.accessLevel = accessLevel;
    if (status) where.status = status;
    if (institution) where.institution = institution;

    // AMC and IGN can only see themselves
    if (['AMC', 'IGN'].includes(session.accessLevel)) {
      where.id = session.id;
    }

    const [members, total] = await Promise.all([
      db.member.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, matricule: true, firstName: true, lastName: true, email: true,
          phone: true, accessLevel: true, status: true, institution: true,
          filiere: true, niveau: true, photoUrl: true, ficheSoumise: true,
          carteEtudiant: true, lastLoginAt: true, createdAt: true,
        },
      }),
      db.member.count({ where }),
    ]);

    return NextResponse.json({ members, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Members GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { memberId, accessLevel, status, ...updateData } = body;

    if (memberId) {
      // Updating another member - need MASTER+ access
      if (!canAccess(session.accessLevel, 'MASTER')) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }

      const target = await db.member.findUnique({ where: { id: memberId } });
      if (!target) return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 });

      // Can't change role of someone with equal or higher access
      if (accessLevel && (ACCESS_HIERARCHY[target.accessLevel] || 0) >= (ACCESS_HIERARCHY[session.accessLevel] || 0)) {
        return NextResponse.json({ error: 'Impossible de modifier ce niveau d\'accès' }, { status: 403 });
      }

      const updatePayload: any = { ...updateData };
      if (accessLevel) updatePayload.accessLevel = accessLevel;
      if (status) updatePayload.status = status;
      if (status === 'ACTIVE' || accessLevel) updatePayload.validatedBy = session.id;
      if (status === 'ACTIVE' || accessLevel) updatePayload.validatedAt = new Date();

      const updated = await db.member.update({ where: { id: memberId }, data: updatePayload });

      await db.auditLog.create({
        data: { action: accessLevel ? 'ROLE_CHANGE' : 'STATUS_CHANGE', actorId: session.id, entityType: 'Member', entityId: memberId, details: `Mise à jour: ${JSON.stringify({ accessLevel, status })}` }
      });

      return NextResponse.json({ success: true, member: updated });
    }

    // Updating own profile
    const { firstName, lastName, phone, address, city, filiere, niveau, institution } = updateData;
    const updated = await db.member.update({
      where: { id: session.id },
      data: { firstName, lastName, phone, address, city, filiere, niveau, institution },
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error) {
    console.error('Members PUT error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
