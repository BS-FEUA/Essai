import { NextRequest, NextResponse } from 'next/server';
import { canAccess, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export const runtime = 'nodejs';

const BUCKET = 'member-avatars';
const BUCKET_MARKER = `/storage/v1/object/public/${BUCKET}/`;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const memberId = req.nextUrl.searchParams.get('memberId') || session.id;
    if (memberId !== session.id && !canAccess(session.accessLevel, 'MAST')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members').select('id, photo_url, status, badge_status').eq('id', memberId).maybeSingle();
    if (memberError) throw memberError;
    if (!member || (memberId !== session.id && (member.status !== 'ACTIVE' || member.badge_status !== 'APPROVED'))) {
      return NextResponse.json({ error: 'Photo indisponible' }, { status: 404 });
    }
    const encodedPath = member.photo_url?.split(BUCKET_MARKER)[1];
    if (!encodedPath) return NextResponse.json({ error: 'Photo indisponible' }, { status: 404 });

    const path = decodeURIComponent(encodedPath);
    if (!path.startsWith(`${memberId}/`) || path.includes('..')) {
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
