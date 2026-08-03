import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';

export async function GET() {
  try {
    const announcements = await db.announcement.findMany({
      where: { isActive: true },
      orderBy: [{ isUrgent: 'desc' }, { createdAt: 'desc' }],
      take: 20,
    });
    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Announcements GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!canAccess(session.accessLevel, 'MAST')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const body = await req.json();
    const { title, content, isUrgent } = body;

    if (!title || !content) return NextResponse.json({ error: 'Titre et contenu requis' }, { status: 400 });

    const announcement = await db.announcement.create({
      data: { title, content, isUrgent: isUrgent || false, createdBy: session.id },
    });

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error) {
    console.error('Announcements POST error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!canAccess(session.accessLevel, 'MAST')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const body = await req.json();
    const { id, title, content, isUrgent, isActive } = body;
    if (!id) return NextResponse.json({ error: 'ID d\'annonce requis' }, { status: 400 });

    const updateData: any = {};
    if (typeof title === 'string') updateData.title = title;
    if (typeof content === 'string') updateData.content = content;
    if (typeof isUrgent === 'boolean') updateData.isUrgent = isUrgent;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updated = await db.announcement.update({ where: { id }, data: updateData });

    await db.auditLog.create({
      data: {
        action: 'UPDATE',
        actorId: session.id,
        entityType: 'Announcement',
        entityId: id,
        details: `Mise à jour annonce: ${updated.title}`,
      },
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error) {
    console.error('Announcements PUT error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!canAccess(session.accessLevel, 'MAST')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const ann = await db.announcement.findUnique({ where: { id } });
    if (!ann) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });

    await db.announcement.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        action: 'DELETE',
        actorId: session.id,
        entityType: 'Announcement',
        entityId: id,
        details: `Suppression annonce: ${ann.title}`,
      },
    });

    return NextResponse.json({ success: true, message: 'Annonce supprimée avec succès' });
  } catch (error) {
    console.error('Announcements DELETE error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

