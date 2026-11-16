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
const MIME_EXTENSIONS: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};
const DOCUMENT_TYPES = ['CARTE_ETUDIANT', 'FICHE_PRE_INSCRIPTION', 'BULLETIN', 'CERTIFICAT', 'AUTRE'] as const;

function hasDocxStructure(buffer: Buffer) {
  const minimumEndOffset = Math.max(0, buffer.length - 65_557);
  let endRecordOffset = -1;
  for (let offset = buffer.length - 22; offset >= minimumEndOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      endRecordOffset = offset;
      break;
    }
  }
  if (endRecordOffset < 0) return false;

  const entries = buffer.readUInt16LE(endRecordOffset + 10);
  let offset = buffer.readUInt32LE(endRecordOffset + 16);
  const names = new Set<string>();
  for (let index = 0; index < entries; index += 1) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== 0x02014b50) return false;
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const entryEnd = offset + 46 + nameLength + extraLength + commentLength;
    if (entryEnd > buffer.length) return false;
    names.add(buffer.toString('utf8', offset + 46, offset + 46 + nameLength));
    offset = entryEnd;
  }
  return names.has('[Content_Types].xml') && names.has('word/document.xml');
}

function matchesDeclaredMime(buffer: Buffer, mimeType: string) {
  switch (mimeType) {
    case 'application/pdf':
      return buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-';
    case 'image/jpeg':
      return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'image/png':
      return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case 'image/webp':
      return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
    case 'application/msword':
      return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return buffer.length >= 4 && buffer.readUInt32LE(0) === 0x04034b50 && hasDocxStructure(buffer);
    default:
      return false;
  }
}

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
    const fileBuffer = Buffer.from(bytes);
    const ext = MIME_EXTENSIONS[file.type];
    if (!ext || path.extname(file.name).toLowerCase() !== ext || !matchesDeclaredMime(fileBuffer, file.type)) {
      return NextResponse.json({ error: 'Le contenu du fichier ne correspond pas à son format déclaré.' }, { status: 400 });
    }
    const fileName = `${randomUUID()}${ext}`;
    const driveFile = await uploadToGoogleDrive({
      buffer: fileBuffer,
      fileName,
      mimeType: file.type,
    });

    // Keep the provider-specific identifier private. Supabase stores only the
    // document metadata and the Google Drive reference.
    const fileUrl = `gdrive://${driveFile.id}`;

    const { data: doc, error: docError } = await supabaseAdmin.from('documents').insert({
      title,
      type,
      file_name: path.basename(file.name).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 255),
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
