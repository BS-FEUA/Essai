import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { uploadToGoogleDrive } from '@/lib/google-drive';
import { randomUUID } from 'crypto';
import path from 'path';

export const runtime = 'nodejs';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
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

    const bytes = await file.arrayBuffer();
    const ext = path.extname(file.name).toLowerCase() || '.pdf';
    const fileName = `${randomUUID()}${ext}`;
    const driveFile = await uploadToGoogleDrive({
      buffer: Buffer.from(bytes),
      fileName,
      mimeType: file.type,
    });

    // Keep the provider-specific identifier private. Supabase stores only the
    // document metadata and the Google Drive reference.
    const fileUrl = `gdrive://${driveFile.id}`;

    const { data: doc, error: docError } = await supabaseAdmin.from('documents').insert({
      title,
      type,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      file_url: fileUrl,
      member_id: session.id,
      annee_scolaire: anneeScolaire,
      description,
    }).select().single();

    if (docError) {
      // Avoid leaving an orphaned file in Drive when metadata persistence fails.
      const { deleteFromGoogleDrive } = await import('@/lib/google-drive');
      await deleteFromGoogleDrive(driveFile.id).catch(() => undefined);
      throw docError;
    }

    await supabaseAdmin.from('audit_logs').insert({
      action: 'DOCUMENT_UPLOAD',
      actor_id: session.id,
      entity_type: 'Document',
      entity_id: doc.id,
      details: JSON.stringify({ message: `Upload: ${title}` }),
    });

    const mappedDoc = {
      ...doc,
      fileName: doc.file_name,
      fileSize: doc.file_size,
      mimeType: doc.mime_type,
      fileUrl: doc.file_url,
      memberId: doc.member_id,
      anneeScolaire: doc.annee_scolaire,
      createdAt: doc.created_at,
    };

    return NextResponse.json({ success: true, document: mappedDoc }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erreur upload' }, { status: 500 });
  }
}
