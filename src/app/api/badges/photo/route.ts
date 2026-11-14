import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export const runtime = 'nodejs';

const BUCKET = 'member-avatars';
const BUCKET_MARKER = `/storage/v1/object/public/${BUCKET}/`;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members').select('photo_url').eq('id', session.id).single();
    if (memberError) throw memberError;
    const encodedPath = member.photo_url?.split(BUCKET_MARKER)[1];
    if (!encodedPath) return NextResponse.json({ error: 'Photo indisponible' }, { status: 404 });

    const path = decodeURIComponent(encodedPath);
    if (!path.startsWith(`${session.id}/`) || path.includes('..')) {
      return NextResponse.json({ error: 'Photo indisponible' }, { status: 404 });
    }

    const { data: file, error: downloadError } = await supabaseAdmin.storage.from(BUCKET).download(path);
    if (downloadError || !file) return NextResponse.json({ error: 'Photo indisponible' }, { status: 404 });
    return new NextResponse(await file.arrayBuffer(), {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Badge photo fetch error:', error);
    return NextResponse.json({ error: 'Impossible de charger la photo.' }, { status: 500 });
  }
}
