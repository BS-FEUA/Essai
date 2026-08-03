import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
const DOCUMENT_TYPES = ['CARTE_ETUDIANT', 'FICHE_PRE_INSCRIPTION', 'BULLETIN', 'CERTIFICAT', 'AUTRE'] as const;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Fichier requis' }, { status: 400 });
    if (!ALLOWED_MIME_TYPES.has(file.type)) return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 });
    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: 'Le fichier doit faire au plus 10 Mo' }, { status: 400 });

    const title = ((formData.get('title') as string) || '').trim().slice(0, 150);
    const description = ((formData.get('description') as string) || '').trim().slice(0, 1000);
    if (!title || !description) return NextResponse.json({ error: 'Titre et description requis' }, { status: 400 });
    const requestedType = (formData.get('type') as string) || 'AUTRE';
    if (!DOCUMENT_TYPES.includes(requestedType as (typeof DOCUMENT_TYPES)[number])) {
      return NextResponse.json({ error: 'Type de document invalide' }, { status: 400 });
    }
    const type = requestedType as (typeof DOCUMENT_TYPES)[number];
    const anneeScolaire = (formData.get('anneeScolaire') as string) || '2025-2026';

    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = path.extname(file.name).toLowerCase() || '.pdf';
    const fileName = `${randomUUID()}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, bytes);

    const doc = await db.document.create({
      data: {
        title, type, fileName: file.name, fileSize: file.size,
        mimeType: file.type, fileUrl: `/uploads/${fileName}`,
        memberId: session.id, anneeScolaire, description,
      },
    });

    // Audit log
    await db.auditLog.create({ data: { action: 'DOCUMENT_UPLOAD', actorId: session.id, entityType: 'Document', entityId: doc.id, details: `Upload: ${title}` } });

    return NextResponse.json({ success: true, document: doc }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erreur upload' }, { status: 500 });
  }
}
