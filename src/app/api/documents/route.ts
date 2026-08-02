import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId') || session.id;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || '';

    if (memberId !== session.id && !canAccess(session.accessLevel, 'MASTER')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const where: any = { memberId };
    if (type) where.type = type;

    const [documents, total] = await Promise.all([
      db.document.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      db.document.count({ where }),
    ]);

    return NextResponse.json({ documents, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Documents GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { title, type, fileName, fileSize, mimeType, description, anneeScolaire } = body;

    const fileUrl = `/documents/${randomUUID()}_${fileName || 'document'}`;
    const doc = await db.document.create({
      data: {
        title, type: type || 'AUTRE', fileName: fileName || 'document.pdf',
        fileSize: fileSize || 0, mimeType: mimeType || 'application/pdf',
        fileUrl, memberId: session.id, description, anneeScolaire,
      },
    });

    await db.auditLog.create({
      data: { action: 'DOCUMENT_UPLOAD', actorId: session.id, entityType: 'Document', entityId: doc.id, details: `Upload: ${title}` },
    });

    return NextResponse.json({ success: true, document: doc }, { status: 201 });
  } catch (error) {
    console.error('Documents POST error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const docId = searchParams.get('id');
    if (!docId) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const doc = await db.document.findUnique({ where: { id: docId } });
    if (!doc || (doc.memberId !== session.id && !canAccess(session.accessLevel, 'MASTER'))) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await db.document.delete({ where: { id: docId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Documents DELETE error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
